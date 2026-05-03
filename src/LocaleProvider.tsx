import { useEffect, type ReactNode } from 'react'
import { LocaleContext } from './i18n'

export function LocaleProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = 'en'
    }
  }, [])

  return <LocaleContext.Provider value={{ locale: 'en' }}>{children}</LocaleContext.Provider>
}
