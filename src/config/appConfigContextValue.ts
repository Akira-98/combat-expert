import { createContext } from 'react'
import type { RuntimeConfig } from './runtimeConfig'

export const AppConfigContext = createContext<RuntimeConfig | undefined>(undefined)
