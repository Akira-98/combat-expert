import { createContext, useContext } from 'react'
import { enAppMessages } from './i18n/app'
import { enCommonMessages } from './i18n/common'
import { enMarketMessages } from './i18n/market'

export type Locale = 'en'

type MessageValue = string

type Messages = Record<Locale, Record<string, MessageValue>>

const messages: Messages = {
  en: {
    ...enCommonMessages,
    ...enMarketMessages,
    ...enAppMessages,
  },
}

export const LocaleContext = createContext<{
  locale: Locale
} | null>(null)

export function getStoredLocale(): Locale {
  return 'en'
}

export function translate(key: string, vars?: Record<string, string | number>, locale = getStoredLocale()) {
  const template = messages[locale][key] ?? key
  if (!vars) return template

  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`))
}

export function useI18n() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useI18n must be used within LocaleProvider')
  }

  return {
    locale: context.locale,
    t: (key: string, vars?: Record<string, string | number>) => translate(key, vars, context.locale),
  }
}
