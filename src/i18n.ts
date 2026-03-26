import { createContext, useContext } from 'react'
import { enAppMessages, koAppMessages } from './i18n/app'
import { enCommonMessages, koCommonMessages } from './i18n/common'
import { enMarketMessages, koMarketMessages } from './i18n/market'

export type Locale = 'ko' | 'en'

type MessageValue = string

type Messages = Record<Locale, Record<string, MessageValue>>

const STORAGE_KEY = 'combat-expert:locale'

const messages: Messages = {
  ko: {
    ...koCommonMessages,
    ...koMarketMessages,
    ...koAppMessages,
  },
  en: {
    ...enCommonMessages,
    ...enMarketMessages,
    ...enAppMessages,
  },
}

export const LocaleContext = createContext<{
  locale: Locale
  setLocale: (locale: Locale) => void
} | null>(null)

function resolveLocale(input: string | null | undefined): Locale {
  return input === 'ko' ? 'ko' : 'en'
}

export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  return resolveLocale(window.localStorage.getItem(STORAGE_KEY))
}

export function translate(key: string, vars?: Record<string, string | number>, locale = getStoredLocale()) {
  const template = messages[locale][key] ?? messages.ko[key] ?? key
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
    setLocale: context.setLocale,
    t: (key: string, vars?: Record<string, string | number>) => translate(key, vars, context.locale),
  }
}
