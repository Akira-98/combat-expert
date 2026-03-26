import { enBetslipMessages, koBetslipMessages } from './betslip'
import { enGuideMessages, koGuideMessages } from './guide'
import { enRankingMessages, koRankingMessages } from './ranking'
import { enSystemMessages, koSystemMessages } from './system'
import type { LocaleMessages } from './types'

export const koAppMessages: LocaleMessages = {
  ...koBetslipMessages,
  ...koGuideMessages,
  ...koRankingMessages,
  ...koSystemMessages,
}

export const enAppMessages: LocaleMessages = {
  ...enBetslipMessages,
  ...enGuideMessages,
  ...enRankingMessages,
  ...enSystemMessages,
}
