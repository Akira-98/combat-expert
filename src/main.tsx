import React from 'react'
import ReactDOM from 'react-dom/client'
import { Buffer } from 'buffer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivyProvider } from '@privy-io/react-auth'
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets'
import { WagmiProvider } from '@privy-io/wagmi'
import { AzuroSDKProvider } from '@azuro-org/sdk'
import { polygon } from 'viem/chains'
import './index.css'
import App from './App.tsx'
import { createWagmiConfig } from './wagmi'
import { AppConfigProvider } from './config/AppConfigContext'
import { loadRuntimeConfig } from './config/runtimeConfig'

if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchIntervalInBackground: false,
    },
  },
})

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Missing #root element')
}

const root = ReactDOM.createRoot(rootElement)

function renderFatalConfigError(message: string) {
  root.render(
    <React.StrictMode>
      <div className="mx-auto mt-16 max-w-xl rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
        <h1 className="m-0 text-lg font-semibold">환경 설정 오류</h1>
        <p className="mt-2 text-sm">{message}</p>
      </div>
    </React.StrictMode>,
  )
}

function createPrivyPolygonChain(rpcUrl: string) {
  return {
    ...polygon,
    rpcUrls: {
      default: { http: [rpcUrl] },
      public: { http: [rpcUrl] },
    },
  }
}

async function bootstrap() {
  try {
    const runtimeConfig = await loadRuntimeConfig()
    const privyPolygonChain = createPrivyPolygonChain(runtimeConfig.rpcUrl)
    const wagmiConfig = createWagmiConfig(runtimeConfig.rpcUrl)

    root.render(
      <React.StrictMode>
        <AppConfigProvider config={runtimeConfig}>
          <PrivyProvider
            appId={runtimeConfig.privyAppId}
            config={{
              defaultChain: privyPolygonChain,
              supportedChains: [privyPolygonChain],
              embeddedWallets: {
                ethereum: {
                  createOnLogin: 'users-without-wallets',
                },
              },
              appearance: {
                showWalletLoginFirst: true,
                walletList: ['metamask'],
              },
              loginMethods: ['google', 'wallet'],
            }}
          >
            <SmartWalletsProvider>
              <QueryClientProvider client={queryClient}>
                <WagmiProvider config={wagmiConfig}>
                  <AzuroSDKProvider initialChainId={polygon.id}>
                    <App />
                  </AzuroSDKProvider>
                </WagmiProvider>
              </QueryClientProvider>
            </SmartWalletsProvider>
          </PrivyProvider>
        </AppConfigProvider>
      </React.StrictMode>,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to bootstrap app config', error)
    renderFatalConfigError(message)
  }
}

void bootstrap()
