import { postJson } from './http'

type BetDebugEventName =
  | 'submit_start'
  | 'submit_timeout'
  | 'order_created'
  | 'bet_success'
  | 'bet_error'

export type BetDebugEvent = {
  event: BetDebugEventName
  walletAddress?: string
  isAAWallet?: boolean
  selectionCount?: number
  hasFreebet?: boolean
  betAmount?: string
  orderId?: string
  orderState?: string
  errorCode?: string
  errorMessage?: string
}

export async function trackBetDebugEvent(event: BetDebugEvent) {
  try {
    await postJson('/api/debug/bet-events', event, 'Failed to record bet debug event')
  } catch (error) {
    console.warn('Failed to record bet debug event', error)
  }
}
