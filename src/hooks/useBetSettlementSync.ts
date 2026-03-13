import { useMemo } from 'react'
import { type Bet, useChain } from '@azuro-org/sdk'
import { useQuery } from '@tanstack/react-query'
import { fetchMarketManagerConditionsByGameIds } from '../api/marketManager'

export type BetSettlementSyncState = 'awaiting-result-sync'

type UseBetSettlementSyncParams = {
  bets: Bet[]
  enabled?: boolean
}

const TERMINAL_CONDITION_STATES = new Set(['Resolved', 'Canceled', 'Stopped'])

const isBetPendingSettlement = (bet: Bet) =>
  !bet.isRedeemed && !bet.isRedeemable && !bet.isLose && !bet.isCanceled

const hasTerminalConditionSignal = (condition: { state: string; wonOutcomeIds: string[] }) =>
  TERMINAL_CONDITION_STATES.has(condition.state) || condition.wonOutcomeIds.length > 0

export function useBetSettlementSync({ bets, enabled = true }: UseBetSettlementSyncParams) {
  const { api, environment } = useChain()

  const pendingBets = useMemo(() => bets.filter(isBetPendingSettlement), [bets])
  const trackedGameIds = useMemo(
    () =>
      [...new Set(pendingBets.flatMap((bet) => bet.outcomes.map((outcome) => outcome.game.gameId)).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [pendingBets],
  )

  const settlementSignalsQuery = useQuery({
    queryKey: ['bet-settlement-sync', api, environment, trackedGameIds],
    queryFn: async () => {
      return fetchMarketManagerConditionsByGameIds({
        apiBaseUrl: api,
        environment,
        gameIds: trackedGameIds,
      })
    },
    enabled: enabled && trackedGameIds.length > 0,
    staleTime: 5_000,
    gcTime: 5 * 60_000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchInterval: 10_000,
  })

  const betSettlementSyncStateByTokenId = useMemo<Record<string, BetSettlementSyncState>>(() => {
    const conditionById = new Map(
      (settlementSignalsQuery.data ?? []).map((condition) => [
        condition.conditionId,
        {
          state: condition.state,
          wonOutcomeIds: condition.wonOutcomeIds ?? [],
        },
      ]),
    )

    return pendingBets.reduce<Record<string, BetSettlementSyncState>>((acc, bet) => {
      if (bet.outcomes.length === 0) return acc

      const conditionSignals = bet.outcomes.map((outcome) => conditionById.get(outcome.conditionId))
      if (conditionSignals.some((signal) => !signal)) return acc

      const resolvedSignals = conditionSignals.filter(
        (signal): signal is { state: string; wonOutcomeIds: string[] } => Boolean(signal),
      )

      if (resolvedSignals.length === bet.outcomes.length && resolvedSignals.every((signal) => hasTerminalConditionSignal(signal))) {
        acc[bet.tokenId] = 'awaiting-result-sync'
      }

      return acc
    }, {})
  }, [pendingBets, settlementSignalsQuery.data])

  return {
    betSettlementSyncStateByTokenId,
  }
}
