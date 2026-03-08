import { useMemo } from 'react'
import type { Address } from 'viem'
import { type Bet, useBets } from '@azuro-org/sdk'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const BET_HISTORY_POLL_MS = 20_000

type UseBetHistoryParams = {
  address?: Address
  isPollingEnabled?: boolean
}

export function useBetHistory({ address, isPollingEnabled = false }: UseBetHistoryParams) {
  const bettorAddress = (address || ZERO_ADDRESS) as Address

  const { data: betsPages } = useBets({
    filter: { bettor: bettorAddress },
    query: {
      enabled: Boolean(address),
      refetchInterval: (query) => {
        if (!isPollingEnabled) return false
        const pages = query.state.data?.pages
        if (!pages?.length) return false
        const hasUnsettledBet = pages.some((page) =>
          page.bets.some((bet) => !bet.isRedeemed && !bet.isRedeemable && !bet.isLose && !bet.isCanceled),
        )
        return hasUnsettledBet ? BET_HISTORY_POLL_MS : false
      },
    },
  })

  const bets = useMemo<Bet[]>(() => {
    if (!betsPages) return []
    return betsPages.pages.flatMap((page) => page.bets)
  }, [betsPages])

  return { bets }
}
