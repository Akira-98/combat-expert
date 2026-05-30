import type { Address } from 'viem'
import { claimBetParticipationPoints } from '../api/points'
import { awardPickSharePoints } from '../api/pickShares'

const POINT_CLAIM_RETRY_DELAYS_MS = [0, 3_000, 10_000]
const PICK_SHARE_POINTS_RETRY_DELAYS_MS = [0, 3_000, 10_000]
const BET_HISTORY_REFETCH_RETRY_DELAYS_MS = [0, 3_000, 10_000]

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function claimBetParticipationPointsWithRetry({ txHash, walletAddress }: { txHash: string; walletAddress: string }) {
  let lastResult

  for (const [index, delay] of POINT_CLAIM_RETRY_DELAYS_MS.entries()) {
    if (delay > 0) await wait(delay)

    lastResult = await claimBetParticipationPoints({ txHash, walletAddress })
    if (lastResult.status !== 'pending_indexing') return lastResult
    if (index === POINT_CLAIM_RETRY_DELAYS_MS.length - 1) return lastResult
  }

  return lastResult
}

async function awardPickSharePointsWithRetry({
  shareId,
  txHash,
  bettorWallet,
}: {
  shareId: string
  txHash: string
  bettorWallet: string
}) {
  let lastResult

  for (const [index, delay] of PICK_SHARE_POINTS_RETRY_DELAYS_MS.entries()) {
    if (delay > 0) await wait(delay)

    lastResult = await awardPickSharePoints({ shareId, txHash, bettorWallet })
    if (lastResult.status !== 'pending_indexing') return lastResult
    if (index === PICK_SHARE_POINTS_RETRY_DELAYS_MS.length - 1) return lastResult
  }

  return lastResult
}

async function refetchBetHistoryWithRetry(refetchBetHistory: () => Promise<unknown>) {
  for (const delay of BET_HISTORY_REFETCH_RETRY_DELAYS_MS) {
    if (delay > 0) await wait(delay)
    try {
      await refetchBetHistory()
    } catch (error) {
      console.warn('Failed to refetch bet history', error)
    }
  }
}

export function useBetSuccessEffects({
  address,
  activePickShareId,
  refetchBetHistory,
  refetchBetTokenBalance,
  onBetPointsClaimed,
  onPickSharePointsAwarded,
}: {
  address?: Address
  activePickShareId?: string
  refetchBetHistory: () => Promise<unknown>
  refetchBetTokenBalance: () => Promise<unknown>
  onBetPointsClaimed?: () => void
  onPickSharePointsAwarded?: () => void
}) {
  const runBetSuccessEffects = (txHash?: string) => {
    void refetchBetHistoryWithRetry(refetchBetHistory)

    if (address && txHash) {
      void claimBetParticipationPointsWithRetry({
        txHash,
        walletAddress: address,
      })
        .then((result) => {
          if (result?.points) onBetPointsClaimed?.()
        })
        .catch((error) => {
          console.warn('Failed to claim bet participation points', error)
        })

      if (activePickShareId) {
        void awardPickSharePointsWithRetry({
          shareId: activePickShareId,
          bettorWallet: address,
          txHash,
        })
          .then((result) => {
            if (result?.ok) onPickSharePointsAwarded?.()
          })
          .catch((error) => {
            console.warn('Failed to award pick share points', error)
          })
      }
    }

    void refetchBetTokenBalance()
  }

  return {
    runBetSuccessEffects,
  }
}
