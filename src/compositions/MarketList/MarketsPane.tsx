import { useState } from 'react'
import { formatGameStartTime } from '../../helpers/formatters'
import { useI18n } from '../../i18n'
import { selectionKey } from '../../helpers/mappers'
import { EmptyState, ErrorState, MarketsSkeleton } from './PaneStates'
import { OutcomeButton } from './OutcomeButton'
import type { MarketsPaneProps } from './types'

export function MarketsPane({
  isMarketsLoading,
  marketsErrorMessage,
  selectedGame,
  marketSections,
  selectedOutcomes,
  selectedOutcomePriceChanges,
  onSelectOutcome,
  onRetryMarkets,
}: MarketsPaneProps) {
  const { t } = useI18n()
  return (
    <div className="grid min-w-0 content-start gap-2 md:gap-3">
      {isMarketsLoading && <MarketsSkeleton />}
      {!isMarketsLoading && marketsErrorMessage && selectedGame && (
        <ErrorState title={t('markets.error')} message={marketsErrorMessage} onRetry={onRetryMarkets} />
      )}

      {marketSections.length > 0 ? (
        <div className="grid gap-2 md:gap-3">
          {marketSections.map((section) => (
            <article
              key={section.id}
              className="card-shell-lg ui-elevated-card border border-[color:var(--app-border)] p-3 md:p-3.5"
            >
              <div className="mb-2.5 flex items-center justify-between gap-2 md:mb-3">
                <h3 className="ui-text-strong m-0 text-sm font-semibold tracking-tight">{section.title}</h3>
                <span className="ui-pill rounded-full border px-2 py-0.5 text-[11px] font-semibold">
                  {section.outcomes.length}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {section.outcomes.map((outcome) => {
                  const key = selectionKey(outcome.conditionId, outcome.outcomeId)
                  return (
                    <OutcomeButton
                      key={key}
                      outcome={outcome}
                      selectedGameParticipants={selectedGame?.participants ?? []}
                      isSelected={selectedOutcomes.has(key)}
                      priceChange={selectedOutcomePriceChanges.get(key)}
                      onSelectOutcome={onSelectOutcome}
                    />
                  )
                })}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!isMarketsLoading && !marketsErrorMessage && !selectedGame && (
        <EmptyState title={t('markets.selectGame')} description={t('markets.selectGameDesc')} />
      )}

      {!isMarketsLoading && !marketsErrorMessage && selectedGame && marketSections.length === 0 && (
        <EmptyState title={t('markets.noOutcomes')} description={t('markets.noOutcomesDesc')} />
      )}
    </div>
  )
}

export function MatchupHero({ selectedGame }: { selectedGame: NonNullable<MarketsPaneProps['selectedGame']> }) {
  const { t } = useI18n()
  const [shareFeedback, setShareFeedback] = useState<{ gameId: string; status: 'copied' | 'failed' }>()
  const [leftName = 'Fighter A', rightName = 'Fighter B'] = selectedGame.participants
  const matchupLabel = [leftName, rightName].filter(Boolean).join(' - ')
  const shareUrl = typeof window === 'undefined'
    ? ''
    : `${window.location.origin}/share/market/${encodeURIComponent(selectedGame.gameId)}`
  const shareStatus = shareFeedback?.gameId === selectedGame.gameId ? shareFeedback.status : 'idle'

  const copyShareUrl = async () => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl)
      return
    }

    const input = document.createElement('textarea')
    input.value = shareUrl
    input.setAttribute('readonly', '')
    input.style.position = 'fixed'
    input.style.top = '-9999px'
    document.body.appendChild(input)
    input.select()

    try {
      if (!document.execCommand('copy')) {
        throw new Error('Copy command failed')
      }
    } finally {
      document.body.removeChild(input)
    }
  }

  const handleShareMarket = async () => {
    if (!shareUrl) return

    const shareData: ShareData = {
      title: selectedGame.title || matchupLabel || 'Combat Expert',
      text: `${selectedGame.leagueName} market on Combat Expert`,
      url: shareUrl,
    }
    const urlOnlyShareData: ShareData = { url: shareUrl }

    try {
      const nativeShareData = !navigator.share
        ? undefined
        : !navigator.canShare || navigator.canShare(shareData)
          ? shareData
          : navigator.canShare(urlOnlyShareData)
            ? urlOnlyShareData
            : undefined

      if (nativeShareData) {
        await navigator.share(nativeShareData)
        return
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
    }

    try {
      await copyShareUrl()
      setShareFeedback({ gameId: selectedGame.gameId, status: 'copied' })
    } catch {
      setShareFeedback({ gameId: selectedGame.gameId, status: 'failed' })
    }
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 md:gap-5">
      <CompetitorProfile initials={getCompetitorInitials(leftName)} align="left" />

      <div className="min-w-[92px] text-center md:min-w-[128px]">
        <p className="ui-text-muted m-0 text-[10px] font-medium uppercase tracking-[0.18em] md:text-[11px]">{selectedGame.leagueName}</p>
        <p className="ui-text-strong mt-2 mb-0 text-sm font-semibold md:text-base">{formatGameStartTime(selectedGame.startsAt)}</p>
        <p className="ui-text-strong mt-3 mb-0 max-w-[18ch] text-xs font-semibold leading-tight md:max-w-[24ch] md:text-sm">{matchupLabel}</p>
        <button
          aria-label={t('market.share')}
          className="ui-ghost-icon mt-3 inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-semibold transition"
          onClick={handleShareMarket}
          title={t('market.share')}
          type="button"
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M8.5 12.5 15.5 16.5" strokeLinecap="round" />
            <path d="M15.5 7.5 8.5 11.5" strokeLinecap="round" />
            <circle cx="6" cy="12" r="2.5" />
            <circle cx="18" cy="6" r="2.5" />
            <circle cx="18" cy="18" r="2.5" />
          </svg>
          {shareStatus !== 'idle' && (
            <span>
              {shareStatus === 'copied' ? t('market.shareCopied') : t('market.shareFailed')}
            </span>
          )}
        </button>
      </div>

      <CompetitorProfile initials={getCompetitorInitials(rightName)} align="right" />
    </div>
  )
}

function CompetitorProfile({ initials, align }: { initials: string; align: 'left' | 'right' }) {
  const layoutClass = align === 'right' ? 'justify-items-end text-right' : 'justify-items-start text-left'

  return (
    <div className={`grid min-w-0 gap-2 ${layoutClass}`}>
      <div className="ui-competitor-frame relative h-18 w-18 rounded-full border p-1.5 md:h-24 md:w-24">
        <div className="ui-competitor-core flex h-full w-full items-center justify-center overflow-hidden rounded-full border">
          <span className="ui-text-strong text-lg font-black tracking-[0.08em] md:text-2xl">{initials}</span>
        </div>
      </div>
    </div>
  )
}

function getCompetitorInitials(name: string) {
  const tokens = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (tokens.length === 0) return '??'

  return tokens
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? '')
    .join('')
}
