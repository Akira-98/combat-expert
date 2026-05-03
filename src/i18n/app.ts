import { enBetslipMessages } from './betslip'
import { enGuideMessages } from './guide'
import { enRankingMessages } from './ranking'
import { enSystemMessages } from './system'
import type { LocaleMessages } from './types'

export const enAppMessages: LocaleMessages = {
  ...enBetslipMessages,
  ...enGuideMessages,
  ...enRankingMessages,
  ...enSystemMessages,
}
