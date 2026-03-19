import { useMemo, useState } from 'react'
import type { Bet } from '@azuro-org/sdk'
import type { BetSettlementSyncState } from '../hooks/useBetSettlementSync'

type MyBetsProps = {
  address?: `0x${string}`
  bets: Bet[]
  betSettlementSyncStateByTokenId?: Record<string, BetSettlementSyncState>
  redeemPending: boolean
  redeemingBetTokenId?: string
  onRedeemBet: (bet: Bet) => void
}

function readHiddenBetTokenIds(storageKey: string | undefined) {
  if (!storageKey || typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((tokenId): tokenId is string => typeof tokenId === 'string')
  } catch {
    return []
  }
}

export function MyBets({
  address,
  bets,
  betSettlementSyncStateByTokenId = {},
  redeemPending,
  redeemingBetTokenId,
  onRedeemBet,
}: MyBetsProps) {
  const storageKey = address ? `combat-expert:hidden-bets:${address.toLowerCase()}` : undefined
  const [hiddenBetTokenIdsByStorageKey, setHiddenBetTokenIdsByStorageKey] = useState<Record<string, string[]>>({})
  const hiddenBetTokenIds = useMemo(
    () => (storageKey ? (hiddenBetTokenIdsByStorageKey[storageKey] ?? readHiddenBetTokenIds(storageKey)) : []),
    [hiddenBetTokenIdsByStorageKey, storageKey],
  )

  const visibleBets = useMemo(
    () => bets.filter((bet) => !hiddenBetTokenIds.includes(bet.tokenId)),
    [bets, hiddenBetTokenIds],
  )

  return (
    <section className="panel section-shell desktop-surface-variant p-2.5 md:p-4">
      <h2 className="ui-text-strong m-0 text-lg font-semibold">내 베팅</h2>
      {!address && <p className="ui-text-muted mt-2 text-sm">지갑 연결 후 조회됩니다.</p>}
      {address && bets.length === 0 && <p className="ui-text-muted mt-2 text-sm">베팅 내역이 없습니다.</p>}
      {address && bets.length > 0 && visibleBets.length === 0 && <p className="ui-text-muted mt-2 text-sm">표시할 베팅이 없습니다.</p>}
      {address && visibleBets.length > 0 && (
        <ul className="m-0 mt-2.5 grid list-none gap-1.5 p-0 md:mt-3 md:gap-2">
          {visibleBets.slice(0, 5).map((bet) => {
            const canRedeem = bet.isRedeemable && !bet.isRedeemed
            const isRedeeming = redeemPending && redeemingBetTokenId === bet.tokenId
            const canDelete = bet.isLose || bet.isRedeemed
            const settlementSyncState = betSettlementSyncStateByTokenId[bet.tokenId]
            const actionLabel = isRedeeming
              ? '수령 중...'
              : canRedeem
                ? '수령하기'
                : bet.isRedeemed
                  ? '수령완료'
                  : bet.isLose
                    ? '정산완료'
                    : settlementSyncState === 'awaiting-result-sync'
                      ? '결과 반영 대기'
                    : '정산대기'
            const primaryOutcome = bet.outcomes[0]
            const gameTitle = primaryOutcome?.game?.title || '경기 정보 없음'
            const summary =
              bet.outcomes.length > 1
                ? `${primaryOutcome?.selectionName || '-'} 외 ${bet.outcomes.length - 1}건`
                : `${primaryOutcome?.marketName || '-'} · ${primaryOutcome?.selectionName || '-'}`

            return (
              <li
                key={`${bet.tokenId}-${bet.createdAt}`}
                className="card-surface-soft card-shell ui-text-body p-2 text-sm md:p-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="ui-text-strong m-0 truncate text-sm font-semibold">{gameTitle}</p>
                    <p className="ui-text-body m-0 truncate text-xs">{summary}</p>
                    <p className="ui-text-strong m-0 text-base font-semibold">베팅 금액 {bet.amount}</p>
                    <p className="ui-text-muted m-0 truncate text-[11px]">
                      #{bet.tokenId} | 상태 {bet.status}
                    </p>
                  </div>
                  <div className="grid shrink-0 gap-1.5">
                    <button
                      className="ui-btn-primary whitespace-nowrap rounded-md border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!canRedeem || redeemPending}
                      onClick={() => onRedeemBet(bet)}
                      type="button"
                    >
                      {actionLabel}
                    </button>
                    {canDelete && (
                      <button
                        aria-label="베팅 숨기기"
                        className="ui-btn-secondary inline-flex h-7 w-7 items-center justify-center rounded-md border transition"
                        onClick={() => {
                          if (!storageKey) return

                          setHiddenBetTokenIdsByStorageKey((prev) => {
                            const current = prev[storageKey] ?? readHiddenBetTokenIds(storageKey)
                            if (current.includes(bet.tokenId)) return prev

                            const nextTokenIds = [...current, bet.tokenId]
                            if (typeof window !== 'undefined') {
                              window.localStorage.setItem(storageKey, JSON.stringify(nextTokenIds))
                            }

                            return {
                              ...prev,
                              [storageKey]: nextTokenIds,
                            }
                          })
                        }}
                        title="삭제"
                        type="button"
                      >
                        <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path d="M3 6h18" strokeLinecap="round" />
                          <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" strokeLinecap="round" />
                          <path d="M7 6l1 14a1 1 0 0 0 1 .93h6a1 1 0 0 0 1-.93l1-14" strokeLinecap="round" />
                          <path d="M10 11v6M14 11v6" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
