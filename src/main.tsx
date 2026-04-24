import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { Buffer } from 'buffer'
import './index.css'
import { AppProviders } from './AppProviders'
import { BootSplash } from './BootSplash'
import { loadRuntimeConfig } from './config/runtimeConfig'
import { translate } from './i18n'
import { LocaleProvider } from './LocaleProvider'

if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Missing #root element')
}

const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <BootSplash />
  </React.StrictMode>,
)

function renderFatalConfigError(message: string) {
  root.render(
    <React.StrictMode>
      <div className="mx-auto mt-16 max-w-xl rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
        <h1 className="m-0 text-lg font-semibold">{translate('fatal.configError')}</h1>
        <p className="mt-2 text-sm">{message}</p>
      </div>
    </React.StrictMode>,
  )
}

async function bootstrap() {
  try {
    const runtimeConfig = await loadRuntimeConfig()

    root.render(
      <React.StrictMode>
        <LocaleProvider>
          <AppProviders runtimeConfig={runtimeConfig} />
          <Analytics />
        </LocaleProvider>
      </React.StrictMode>,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to bootstrap app config', error)
    renderFatalConfigError(message)
  }
}

void bootstrap()
