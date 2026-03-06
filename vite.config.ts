import crypto from 'node:crypto'
import * as Ably from 'ably'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
const isAnalyze = process.env.ANALYZE === 'true'
const DEFAULT_ABLY_TTL_MS = 60 * 60 * 1000
const FALLBACK_POLYGON_RPC_URL = 'https://polygon-rpc.com'

type AppServerEnv = {
  AFFILIATE: string
  RPC_URL: string
  WALLETCONNECT_PROJECT_ID: string
  PRIVY_APP_ID: string
  ABLY_API_KEY: string
  ABLY_CHANNEL: string
  ABLY_CAPABILITY_JSON: string
  ABLY_TOKEN_TTL_MS: string
}

function getNodeModulePackageName(id: string) {
  const normalized = id.split('\\').join('/')
  const marker = '/node_modules/'
  const idx = normalized.lastIndexOf(marker)
  if (idx === -1) return null

  const subpath = normalized.slice(idx + marker.length)
  const parts = subpath.split('/')
  if (parts[0]?.startsWith('@') && parts[1]) {
    return `${parts[0]}/${parts[1]}`
  }
  return parts[0] ?? null
}

function normalizePolygonRpcUrl(rpcUrl: string | undefined) {
  const trimmed = (rpcUrl || '').trim()
  if (!trimmed) return ''

  // The bare Ankr endpoint requires an API key and returns 401 for public traffic.
  if (trimmed === 'https://rpc.ankr.com/polygon') {
    return FALLBACK_POLYGON_RPC_URL
  }

  return trimmed
}

function createRuntimeServerPlugin(env: Partial<AppServerEnv>): Plugin {
  const zeroAddress = '0x0000000000000000000000000000000000000000'

  const getPublicConfig = () => ({
    affiliateAddress: env.AFFILIATE || zeroAddress,
    rpcUrl: normalizePolygonRpcUrl(env.RPC_URL),
    walletConnectProjectId: env.WALLETCONNECT_PROJECT_ID || '',
    privyAppId: env.PRIVY_APP_ID || '',
    ablyChannel: env.ABLY_CHANNEL || 'chat:ufc:live',
  })

  const sendJson = (res: { statusCode: number; setHeader: (name: string, value: string) => void; end: (body: string) => void }, statusCode: number, payload: unknown) => {
    res.statusCode = statusCode
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-store')
    res.end(JSON.stringify(payload))
  }

  const handleApiRequest = async (
    req: { method?: string; url?: string },
    res: { statusCode: number; setHeader: (name: string, value: string) => void; end: (body: string) => void },
  ) => {
    const requestUrl = new URL(req.url || '/', 'http://localhost')

    if (requestUrl.pathname === '/api/public-config') {
      if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' })

      const config = getPublicConfig()
      if (!config.rpcUrl || !config.privyAppId || !config.walletConnectProjectId) {
        return sendJson(res, 500, { error: 'Missing required server env configuration' })
      }
      return sendJson(res, 200, config)
    }

    if (requestUrl.pathname === '/api/ably-token') {
      if (req.method !== 'GET' && req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })

      const apiKey = env.ABLY_API_KEY || ''
      if (!apiKey) return sendJson(res, 500, { error: 'ABLY_API_KEY is not set' })

      const requestedClientId = requestUrl.searchParams.get('clientId') || ''
      const clientId = requestedClientId.trim() || `guest-${crypto.randomUUID()}`
      const capability =
        env.ABLY_CAPABILITY_JSON ||
        JSON.stringify({
          [env.ABLY_CHANNEL || 'chat:ufc:live']: ['publish', 'subscribe', 'history', 'presence'],
        })
      const ttlMs = Number(env.ABLY_TOKEN_TTL_MS || DEFAULT_ABLY_TTL_MS)

      try {
        const restClient = new Ably.Rest({ key: apiKey })
        const tokenRequest = await restClient.auth.createTokenRequest({
          clientId,
          capability,
          ttl: Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : DEFAULT_ABLY_TTL_MS,
        })
        return sendJson(res, 200, tokenRequest)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create token request'
        return sendJson(res, 500, { error: message })
      }
    }
  }

  return {
    name: 'runtime-api-dev-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api/public-config') || req.url?.startsWith('/api/ably-token')) {
          void handleApiRequest(req, res)
          return
        }
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api/public-config') || req.url?.startsWith('/api/ably-token')) {
          void handleApiRequest(req, res)
          return
        }
        next()
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    resolve: {
      alias: {
        // Keep SDK AA connector on a stable shim.
        // Pointing this alias to app hooks can re-introduce ChainProvider hook-order errors.
        '@azuro-org/sdk-social-aa-connector': fileURLToPath(
          new URL('./src/azuroSdkSocialAaConnectorShim.ts', import.meta.url),
        ),
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      createRuntimeServerPlugin(env as Partial<AppServerEnv>),
      ...(isAnalyze
        ? [
            visualizer({
              filename: 'dist/stats.html',
              open: false,
              gzipSize: true,
              brotliSize: true,
            }),
          ]
        : []),
    ],
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          const message = String(warning.message ?? '')
          const moduleId = String(warning.id ?? '')
          const isNodeModulesWarning = moduleId.includes('node_modules/')
          const isPureAnnotationWarning =
            message.includes('contains an annotation that Rollup cannot interpret') && message.includes('/*#__PURE__*/')

          if (isNodeModulesWarning && isPureAnnotationWarning) return

          warn(warning)
        },
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            const pkg = getNodeModulePackageName(id)
            if (!pkg) return

            if (pkg === 'react' || pkg === 'react-dom' || pkg === 'scheduler') return 'react-vendor'
            if (pkg === '@tanstack/react-query') return 'query'
            if (
              pkg.startsWith('@privy-io/') ||
              pkg.startsWith('@walletconnect/') ||
              pkg.startsWith('@reown/') ||
              pkg === 'wagmi' ||
              pkg === 'viem' ||
              pkg === '@wagmi/core' ||
              pkg.startsWith('@coinbase/') ||
              pkg.startsWith('@base-org/') ||
              pkg === 'porto'
            ) {
              return 'auth-stack'
            }
            if (pkg.startsWith('@azuro-org/')) return 'azuro-stack'
            if (pkg === 'graphql' || pkg === 'graphql-tag') return 'graphql-stack'
          },
        },
      },
    },
  }
})
