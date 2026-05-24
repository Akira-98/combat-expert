import { useEffect, useMemo, useState } from 'react'
import type { Bet } from '@azuro-org/sdk'
import type { BetSettlementSyncState } from '../hooks/useBetSettlementSync'
import { useHiddenBets } from '../hooks/useHiddenBets'
import { useI18n } from '../i18n'
import { ParticipantAvatar } from './ParticipantAvatar'

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

function getNormalizedDate(value?: number | string | null) {
  if (value == null) return undefined
  const timestamp = Number(value)
  if (!Number.isFinite(timestamp) || timestamp <= 0) return undefined

  return new Date(timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp)
}

function formatDateTime(value?: number | string | null) {
  const date = getNormalizedDate(value)
  if (!date) return '-'

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function formatGameStart(value?: number | string | null) {
  const date = getNormalizedDate(value)
  if (!date) return '-'

  const now = new Date()
  const startDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const dayDiff = Math.round((startDay - today) / 86_400_000)
  const dayLabel = dayDiff === 0 ? 'Today' : dayDiff === 1 ? 'Tomorrow' : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)
  const timeLabel = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date)

  return `${dayLabel} · ${timeLabel}`
}

function formatUsdtAmount(value?: number | string | null, fallback = '-') {
  if (value == null) return fallback
  const amount = Number(value)
  if (!Number.isFinite(amount)) return fallback

  return `${amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} USDT`
}

function getPossibleWin(bet: Bet) {
  if (Number.isFinite(bet.possibleWin)) return bet.possibleWin

  const amount = Number(bet.amount)
  return Number.isFinite(amount) && Number.isFinite(bet.totalOdds) ? amount * bet.totalOdds : undefined
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
  const [detailsBet, setDetailsBet] = useState<Bet | undefined>()
  const storageKey = address ? `betaker:hidden-bets:${address.toLowerCase()}` : undefined
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
                onOpenDetails={setDetailsBet}
                onRedeemBet={onRedeemBet}
                settlementSyncState={betSettlementSyncStateByTokenId[bet.tokenId]}
              />
            )
          })}
        </ul>
      )}
      {detailsBet && <BetDetailsDialog bet={detailsBet} onClose={() => setDetailsBet(undefined)} />}
    </section>
  )
}

type MyBetListItemProps = {
  bet: Bet
  isRedeemDisabled: boolean
  isRedeeming: boolean
  onHideBet: (tokenId: string) => void
  onOpenDetails: (bet: Bet) => void
  onRedeemBet: (bet: Bet) => void
  settlementSyncState?: BetSettlementSyncState
}

function MyBetListItem({
  bet,
  isRedeemDisabled,
  isRedeeming,
  onHideBet,
  onOpenDetails,
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
    <li className="card-surface-soft card-shell ui-text-body min-w-0 p-2 text-sm md:p-2.5">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 basis-44 space-y-1">
          <p className="ui-text-strong m-0 truncate text-sm font-semibold">{gameTitle}</p>
          <p className="ui-text-body m-0 truncate text-xs">{summary}</p>
          <p className="ui-text-strong m-0 text-base font-semibold">{t('myBets.amount', { amount: bet.amount })}</p>
          <p className="ui-text-muted m-0 truncate text-[11px]">
            #{bet.tokenId} | {t('myBets.status', { status: bet.status ?? '-' })}
          </p>
        </div>
        <div className="grid min-w-0 shrink-0 gap-1.5 max-[380px]:w-full">
          <button
            className="ui-btn-primary min-w-0 truncate rounded-md border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canRedeem || isRedeemDisabled}
            onClick={() => onRedeemBet(bet)}
            type="button"
            title={actionLabel}
          >
            {actionLabel}
          </button>
          <button
            className="ui-btn-secondary min-w-0 truncate rounded-md border px-3 py-1.5 text-xs font-semibold transition"
            onClick={() => onOpenDetails(bet)}
            type="button"
            title={t('myBets.moreDetails')}
          >
            {t('myBets.moreDetails')}
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

type BetDetailsDialogProps = {
  bet: Bet
  onClose: () => void
}

function BetDetailsDialog({ bet, onClose }: BetDetailsDialogProps) {
  const { t } = useI18n()
  const primaryOutcome = bet.outcomes[0]
  const game = primaryOutcome?.game
  const participants = game?.participants ?? []
  const betTypeLabel = bet.outcomes.length <= 1 ? t('myBets.single') : t('myBets.combo', { count: bet.outcomes.length })
  const statusLabel = bet.status ?? bet.orderState ?? '-'
  const possibleWin = getPossibleWin(bet)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-2 py-3 backdrop-blur-sm sm:items-center sm:px-4" role="presentation" onMouseDown={onClose}>
      <div
        aria-modal="true"
        className="desktop-surface-variant ui-text-body w-full max-w-[560px] rounded-t-2xl border border-white/10 p-4 shadow-2xl sm:rounded-2xl sm:p-5"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="ui-text-strong m-0 text-xl font-semibold">{t('myBets.detailsTitle')}</h3>
            <p className="ui-text-muted m-0 mt-2 text-sm">
              {betTypeLabel} / {formatDateTime(bet.createdAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-sm font-semibold text-[#b8b3ff]">✓ {statusLabel}</span>
            <button
              aria-label={t('myBets.closeDetails')}
              className="ui-btn-ghost inline-flex h-9 w-9 items-center justify-center rounded-md text-white/70 transition hover:text-white"
              onClick={onClose}
              type="button"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="card-surface-soft mt-5 rounded-xl border border-white/8 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex shrink-0 -space-x-2">
              {participants.slice(0, 2).map((participant) => (
                <ParticipantAvatar key={participant.name} participant={participant} className="h-12 w-12 border-2 border-[#202027] text-sm" />
              ))}
            </div>
            <div className="min-w-0">
              <p className="ui-text-muted m-0 text-sm font-semibold">{formatGameStart(game?.startsAt)}</p>
              <p className="ui-text-strong m-0 mt-1 truncate text-base font-semibold">{game?.title ?? t('myBets.noGameInfo')}</p>
            </div>
          </div>

          <div className="mt-4 border-t border-white/10 pt-4">
            {bet.outcomes.map((outcome, index) => (
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 py-1.5 text-sm" key={`${outcome.conditionId}-${outcome.outcomeId}-${index}`}>
                <span className="ui-text-muted font-semibold">{t('myBets.market')}</span>
                <span className="ui-text-strong max-w-[230px] truncate text-right font-semibold">{outcome.marketName || '-'}</span>
                <span className="ui-text-muted font-semibold">{t('myBets.outcome')}</span>
                <span className="ui-text-strong text-right font-semibold">{outcome.selectionName || '-'}</span>
                <span className="ui-text-muted font-semibold">{t('myBets.odds')}</span>
                <span className="ui-text-strong text-right font-semibold">{Number.isFinite(outcome.odds) ? outcome.odds.toFixed(2) : '-'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="ui-text-muted font-semibold">{t('myBets.betAmount')}</span>
            <strong className="ui-text-strong text-base">{formatUsdtAmount(bet.amount)}</strong>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="ui-text-muted font-semibold">{t('myBets.possibleWin')}</span>
            <strong className="text-base text-[#b8b3ff]">{formatUsdtAmount(possibleWin)}</strong>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="ui-text-muted font-semibold">{t('myBets.tokenId')}</span>
            <span className="ui-text-body min-w-0 truncate text-right">#{bet.tokenId}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
