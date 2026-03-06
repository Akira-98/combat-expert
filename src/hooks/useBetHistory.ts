import { useMemo } from 'react'
import type { Address } from 'viem'
import { type Bet, useBets } from '@azuro-org/sdk'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

type UseBetHistoryParams = {
  address?: Address
}

export function useBetHistory({ address }: UseBetHistoryParams) {
  const bettorAddress = (address || ZERO_ADDRESS) as Address

  const { data: betsPages } = useBets({
    filter: { bettor: bettorAddress },
    query: { enabled: Boolean(address) },
  })

  const bets = useMemo<Bet[]>(() => {
    if (!betsPages) return []
    return betsPages.pages.flatMap((page) => page.bets)
  }, [betsPages])

  return { bets }
}
