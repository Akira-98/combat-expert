import { useEffect } from 'react'
import type { Bet } from '@azuro-org/sdk'
import { useI18n } from '../../i18n'
import { normalizeOutcomeLabel } from '../../helpers/outcomes'
import { ParticipantAvatar } from '../ParticipantAvatar'

type BetDetailsDialogProps = {
  bet: Bet
  onClose: () => void
}

function getOutcomeLabel(outcome?: Bet['outcomes'][number]) {
  const selectionName = outcome?.selectionName || '-'
  const participants = outcome?.game?.participants ?? []
  return normalizeOutcomeLabel(
    selectionName,
    participants.map((participant) => participant.name),
  )
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

export function BetDetailsDialog({ bet, onClose }: BetDetailsDialogProps) {
  const { t } = useI18n()
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
        className="desktop-surface-variant ui-text-body min-w-0 w-full max-w-[calc(100vw-1rem)] overflow-hidden rounded-t-2xl border border-white/10 p-4 shadow-2xl sm:max-w-[560px] sm:rounded-2xl sm:p-5"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="ui-text-strong m-0 text-xl font-semibold">{t('myBets.detailsTitle')}</h3>
            <p className="ui-text-muted m-0 mt-2 break-words text-sm [overflow-wrap:anywhere]">
              {betTypeLabel} / {formatDateTime(bet.createdAt)}
            </p>
          </div>
          <div className="flex min-w-0 shrink-0 items-center gap-2">
            <span className="min-w-0 max-w-28 truncate text-sm font-semibold text-[#b8b3ff]" title={statusLabel}>✓ {statusLabel}</span>
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

        <div className="mt-5 grid max-h-[58vh] gap-3 overflow-y-auto pr-1">
          {bet.outcomes.map((outcome, index) => {
            const game = outcome.game
            const participants = game?.participants ?? []
            const outcomeLabel = getOutcomeLabel(outcome)

            return (
              <div className="card-surface-soft min-w-0 overflow-hidden rounded-xl border border-white/8 p-4" key={`${outcome.conditionId}-${outcome.outcomeId}-${index}`}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex min-w-10 shrink-0 -space-x-2">
                    {participants.length > 0 ? (
                      participants.slice(0, 2).map((participant) => (
                        <ParticipantAvatar key={participant.name} participant={participant} className="h-12 w-12 border-2 border-[#202027] text-sm" />
                      ))
                    ) : (
                      <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#202027] bg-white/8 text-sm font-semibold">?</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="ui-text-muted m-0 text-sm font-semibold">{formatGameStart(game?.startsAt)}</p>
                    <p className="ui-text-strong m-0 mt-1 break-words text-base font-semibold [overflow-wrap:anywhere]">{game?.title ?? t('myBets.noGameInfo')}</p>
                  </div>
                </div>

                <div className="mt-4 grid min-w-0 grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,auto)]">
                  <span className="ui-text-muted font-semibold">{t('myBets.market')}</span>
                  <span className="ui-text-strong min-w-0 break-words text-right font-semibold [overflow-wrap:anywhere] sm:max-w-[230px]">{outcome.marketName || '-'}</span>
                  <span className="ui-text-muted font-semibold">{t('myBets.outcome')}</span>
                  <span className="ui-text-strong min-w-0 break-words text-right font-semibold [overflow-wrap:anywhere]">{outcomeLabel}</span>
                  <span className="ui-text-muted font-semibold">{t('myBets.odds')}</span>
                  <span className="ui-text-strong text-right font-semibold">{Number.isFinite(outcome.odds) ? outcome.odds.toFixed(2) : '-'}</span>
                </div>
              </div>
            )
          })}
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
            <span className="ui-text-body min-w-0 break-all text-right">#{bet.tokenId}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
