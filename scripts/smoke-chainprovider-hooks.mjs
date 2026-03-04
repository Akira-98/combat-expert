import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const DEV_PORT = 4173
const DEV_URL = `http://127.0.0.1:${DEV_PORT}`
const MAX_WAIT_MS = 45_000
const ERROR_PATTERNS = [
  'React has detected a change in the order of Hooks called by ChainProvider',
  "Cannot read properties of undefined (reading 'length')",
]

let server
let browser

function startDevServer() {
  server = spawn(
    'npm',
    ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(DEV_PORT), '--strictPort'],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, CI: '1' },
    },
  )

  server.stdout.on('data', (chunk) => {
    process.stdout.write(`[vite] ${String(chunk)}`)
  })
  server.stderr.on('data', (chunk) => {
    process.stderr.write(`[vite] ${String(chunk)}`)
  })
}

async function waitForServerReady() {
  const startedAt = Date.now()
  while (Date.now() - startedAt < MAX_WAIT_MS) {
    try {
      const response = await fetch(DEV_URL, { method: 'GET' })
      if (response.ok) return
    } catch {
      // server is not ready yet
    }
    await delay(500)
  }
  throw new Error(`Timed out waiting for dev server at ${DEV_URL}`)
}

async function runSmoke() {
  const matchedMessages = []

  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  page.on('console', (msg) => {
    const text = msg.text()
    if (ERROR_PATTERNS.some((pattern) => text.includes(pattern))) {
      matchedMessages.push(`[console:${msg.type()}] ${text}`)
    }
  })

  page.on('pageerror', (error) => {
    const text = String(error?.message ?? error)
    if (ERROR_PATTERNS.some((pattern) => text.includes(pattern))) {
      matchedMessages.push(`[pageerror] ${text}`)
    }
  })

  await page.goto(DEV_URL, { waitUntil: 'networkidle', timeout: MAX_WAIT_MS })
  await delay(5_000)

  if (matchedMessages.length > 0) {
    throw new Error(`Detected ChainProvider hook regression:\n${matchedMessages.join('\n')}`)
  }
}

async function cleanup(exitCode = 0) {
  if (browser) {
    await browser.close()
  }

  if (server && !server.killed) {
    server.kill('SIGTERM')
    await delay(500)
    if (!server.killed) {
      server.kill('SIGKILL')
    }
  }

  process.exit(exitCode)
}

async function main() {
  try {
    startDevServer()
    await waitForServerReady()
    await runSmoke()
    console.log('ChainProvider hook smoke check passed.')
    await cleanup(0)
  } catch (error) {
    console.error(error)
    await cleanup(1)
  }
}

main()
