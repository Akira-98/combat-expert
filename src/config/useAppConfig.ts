import { useContext } from 'react'
import { AppConfigContext } from './appConfigContextValue'

export function useAppConfig() {
  const config = useContext(AppConfigContext)
  if (!config) {
    throw new Error('AppConfigProvider is missing')
  }
  return config
}
