import { type ReactNode } from 'react'
import type { RuntimeConfig } from './runtimeConfig'
import { AppConfigContext } from './appConfigContextValue'

export function AppConfigProvider({
  config,
  children,
}: {
  config: RuntimeConfig
  children: ReactNode
}) {
  return <AppConfigContext.Provider value={config}>{children}</AppConfigContext.Provider>
}
