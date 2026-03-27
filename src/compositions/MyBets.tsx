import { useMemo } from 'react'
import type { Bet } from '@azuro-org/sdk'
import type { BetSettlementSyncState } from '../hooks/useBetSettlementSync'
import { useHiddenBets } from '../hooks/useHiddenBets'
import { useI18n } from '../i18n'

type MyBetsProps = {
  address?: `0x${string}`
  bets: Bet[]
  betSettlementSyncStateByTokenId?: Record<string, BetSettlementSyncState>
  redeemPending: boolean
  redeemingBetTokenId?: string
  onRedeemBet: (bet: Bet) => void
  isEmbedded?: boolean
}

function getBetActionLabel({
  bet,
  isRedeeming,
  settlementSyncState,
  t,
}: {
  bet: Bet
  isRedeeming: boolean
  settlementSyncState?: BetSettlementSyncState
  t: ReturnType<typeof useI18n>['t']
}) {
  if (isRedeeming) return t('myBets.redeeming')
  if (bet.isRedeemable && !bet.isRedeemed) return t('myBets.redeem')
  if (bet.isRedeemed) return t('myBets.redeemed')
  if (bet.isLose) return t('myBets.settled')
  if (settlementSyncState === 'awaiting-result-sync') return t('myBets.awaitingResult')
  return t('myBets.awaitingSettlement')
}

function getBetSummary(bet: Bet, t: ReturnType<typeof useI18n>['t']) {
  const primaryOutcome = bet.outcomes[0]
  if (bet.outcomes.length > 1) {
    return `${primaryOutcome?.selectionName || '-'} ${t('myBets.andMore', { count: bet.outcomes.length - 1 })}`
  }

  return `${primaryOutcome?.marketName || '-'} · ${primaryOutcome?.selectionName || '-'}`
}

export function MyBets({
  address,
  bets,
  betSettlementSyncStateByTokenId = {},
  redeemPending,
  redeemingBetTokenId,
  onRedeemBet,
  isEmbedded = false,
}: MyBetsProps) {
  const { t } = useI18n()
  const storageKey = address ? `combat-expert:hidden-bets:${address.toLowerCase()}` : undefined
  const { hiddenBetTokenIds, hideBet } = useHiddenBets(storageKey)

  const visibleBets = useMemo(
    () => bets.filter((bet) => !hiddenBetTokenIds.includes(bet.tokenId)),
    [bets, hiddenBetTokenIds],
  )
  const sectionClassName = isEmbedded
    ? 'section-shell border-0 bg-transparent px-0 py-0 shadow-none'
    : 'panel section-shell desktop-surface-variant p-2.5 md:px-0 md:py-1'

  return (
    <section className={sectionClassName}>
      <h2 className="ui-text-strong m-0 text-lg font-semibold">{t('myBets.title')}</h2>
      {!address && <p className="ui-text-muted mt-2 text-sm">{t('myBets.connectWallet')}</p>}
      {address && bets.length === 0 && <p className="ui-text-muted mt-2 text-sm">{t('myBets.noBets')}</p>}
      {address && bets.length > 0 && visibleBets.length === 0 && <p className="ui-text-muted mt-2 text-sm">{t('myBets.noVisibleBets')}</p>}
      {address && visibleBets.length > 0 && (
        <ul className="m-0 mt-2.5 grid list-none gap-1.5 p-0 md:mt-3 md:gap-2">
          {visibleBets.slice(0, 5).map((bet) => {
            return (
              <MyBetListItem
                key={`${bet.tokenId}-${bet.createdAt}`}
                bet={bet}
                isRedeemDisabled={redeemPending}
                isRedeeming={redeemPending && redeemingBetTokenId === bet.tokenId}
                onHideBet={hideBet}
                onRedeemBet={onRedeemBet}
                settlementSyncState={betSettlementSyncStateByTokenId[bet.tokenId]}
              />
            )
          })}
        </ul>
      )}
    </section>
  )
}

type MyBetListItemProps = {
  bet: Bet
  isRedeemDisabled: boolean
  isRedeeming: boolean
  onHideBet: (tokenId: string) => void
  onRedeemBet: (bet: Bet) => void
  settlementSyncState?: BetSettlementSyncState
}

function MyBetListItem({
  bet,
  isRedeemDisabled,
  isRedeeming,
  onHideBet,
  onRedeemBet,
  settlementSyncState,
}: MyBetListItemProps) {
  const { t } = useI18n()
  const canRedeem = bet.isRedeemable && !bet.isRedeemed
  const canHide = bet.isLose || bet.isRedeemed
  const primaryOutcome = bet.outcomes[0]
  const actionLabel = getBetActionLabel({ bet, isRedeeming, settlementSyncState, t })
  const gameTitle = primaryOutcome?.game?.title || t('myBets.noGameInfo')
  const summary = getBetSummary(bet, t)

  return (
    <li className="card-surface-soft card-shell ui-text-body p-2 text-sm md:p-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="ui-text-strong m-0 truncate text-sm font-semibold">{gameTitle}</p>
          <p className="ui-text-body m-0 truncate text-xs">{summary}</p>
          <p className="ui-text-strong m-0 text-base font-semibold">{t('myBets.amount', { amount: bet.amount })}</p>
          <p className="ui-text-muted m-0 truncate text-[11px]">
            #{bet.tokenId} | {t('myBets.status', { status: bet.status ?? '-' })}
          </p>
        </div>
        <div className="grid shrink-0 gap-1.5">
          <button
            className="ui-btn-primary whitespace-nowrap rounded-md border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canRedeem || isRedeemDisabled}
            onClick={() => onRedeemBet(bet)}
            type="button"
          >
            {actionLabel}
          </button>
          {canHide && (
            <button
              aria-label={t('myBets.hide')}
              className="ui-btn-secondary inline-flex h-7 w-7 items-center justify-center rounded-md border transition"
              onClick={() => onHideBet(bet.tokenId)}
              title={t('myBets.delete')}
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
}
