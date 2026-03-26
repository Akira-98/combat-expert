import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { getStoredLocale, LocaleContext, type Locale } from './i18n'

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => getStoredLocale())

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('combat-expert:locale', locale)
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale }), [locale])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
