import { useMemo } from 'react'
import { useI18n } from '../../i18n'
import { selectionKey, mapMarketsToSections } from '../../helpers/mappers'
import { useMarketManagerConditions } from '../../hooks/useMarketManagerConditions'
import type { GameItem, OutcomeItem, SelectionKey } from '../../types/ui'
import { normalizeOutcomeLabel, outcomePreviewPriority, truncateLabel } from '../MarketList/helpers'

type TopEventsShowcaseProps = {
  games: GameItem[]
  selectedOutcomes: Set<SelectionKey>
  onOpenGameMarkets: (gameId: string) => void
  onSelectOutcome: (outcome: OutcomeItem) => void
}

const FEATURED_EVENT_MATCHERS = ['della maddalena', 'carlos prates']

function matchesFeaturedEvent(game: GameItem) {
  const haystack = `${game.title} ${game.participants.join(' ')}`.toLowerCase()
  return FEATURED_EVENT_MATCHERS.every((matcher) => haystack.includes(matcher))
}

function formatEventDateParts(startsAt: string) {
  const date = new Date(startsAt)
  if (Number.isNaN(date.getTime())) {
    return { dateLabel: '', timeLabel: '' }
  }

  return {
    dateLabel: new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short' }).format(date),
    timeLabel: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date),
  }
}

export function TopEventsShowcase({
  games,
  selectedOutcomes,
  onOpenGameMarkets,
  onSelectOutcome,
}: TopEventsShowcaseProps) {
  const game = useMemo(() => games.find(matchesFeaturedEvent), [games])

  if (!game) return null

  return (
    <section className="grid gap-3 md:mt-2 md:gap-4">
      <div className="flex items-center gap-2 px-1">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-amber-300 via-orange-400 to-red-500 text-black" aria-hidden="true">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 1.75 12.35 7.7l5.9 2.3-5.9 2.3L10 18.25 7.65 12.3 1.75 10l5.9-2.3L10 1.75Z" />
          </svg>
        </span>
        <p className="ui-text-strong m-0 text-lg font-bold">Top Events</p>
      </div>
      <TopEventCard
        game={game}
        selectedOutcomes={selectedOutcomes}
        onOpenGameMarkets={onOpenGameMarkets}
        onSelectOutcome={onSelectOutcome}
      />
    </section>
  )
}

function TopEventCard({
  game,
  selectedOutcomes,
  onOpenGameMarkets,
  onSelectOutcome,
}: {
  game: GameItem
  selectedOutcomes: Set<SelectionKey>
  onOpenGameMarkets: (gameId: string) => void
  onSelectOutcome: (outcome: OutcomeItem) => void
}) {
  const [leftName = 'Fighter A', rightName = 'Fighter B'] = game.participants
  const { dateLabel, timeLabel } = formatEventDateParts(game.startsAt)

  return (
    <article className="card-surface-soft card-shell-xl overflow-hidden p-0">
      <button
        className="relative block w-full border-0 bg-transparent p-0 text-left"
        onClick={() => onOpenGameMarkets(game.gameId)}
        type="button"
      >
        <div className="relative min-h-[280px] overflow-hidden">
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            src="/images/octagon.png"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/45" />
          <img
            alt=""
            className="absolute inset-x-0 bottom-0 mx-auto h-[78%] w-full max-w-[28rem] object-contain object-bottom drop-shadow-[0_22px_28px_rgba(0,0,0,0.6)] md:h-[84%] md:max-w-[34rem]"
            src="/images/perth.png"
          />
          <div className="relative grid gap-6 p-4 md:p-6">
            <p className="m-0 text-center text-sm font-semibold text-white/75">{game.leagueName}</p>

            <div className="grid min-h-[190px] items-end md:min-h-[210px]">
              <div className="relative z-10 text-center">
                <p className="m-0 text-sm font-semibold text-white/75">{dateLabel}</p>
                <p className="m-0 mt-1 text-xl font-bold text-white">{timeLabel}</p>
                <p className="m-0 mt-3 text-lg font-bold leading-tight text-white md:text-2xl">
                  {leftName} <span className="text-white/60">vs</span> {rightName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </button>

      <div className="border-t border-white/5 bg-black/30 px-3 py-3 md:px-4">
        <TopEventOdds
          game={game}
          selectedOutcomes={selectedOutcomes}
          onSelectOutcome={onSelectOutcome}
        />
      </div>
    </article>
  )
}

function TopEventOdds({
  game,
  selectedOutcomes,
  onSelectOutcome,
}: {
  game: GameItem
  selectedOutcomes: Set<SelectionKey>
  onSelectOutcome: (outcome: OutcomeItem) => void
}) {
  const { t } = useI18n()
  const { data: markets, isLoading, isError } = useMarketManagerConditions({
    gameIds: [game.gameId],
    enabled: true,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  })

  const preview = useMemo(() => {
    const sections = mapMarketsToSections(markets ?? [])
    const firstSection = sections.find((section) => section.outcomes.length > 0)
    if (!firstSection) return { title: t('market.previewEmpty'), outcomes: [] }

    return {
      title: firstSection.title,
      outcomes: [...firstSection.outcomes]
        .sort((a, b) => {
          const byPriority = outcomePreviewPriority(a.selectionName) - outcomePreviewPriority(b.selectionName)
          if (byPriority !== 0) return byPriority
          return a.selectionName.localeCompare(b.selectionName)
        })
        .slice(0, 3),
    }
  }, [markets, t])

  if (isLoading) {
    return <p className="ui-text-muted m-0 rounded-md bg-black/30 p-3 text-center text-sm">{t('market.previewLoading')}</p>
  }

  if (isError) {
    return <p className="ui-text-danger m-0 rounded-md bg-black/30 p-3 text-center text-sm">{t('market.previewError')}</p>
  }

  if (preview.outcomes.length === 0) {
    return <p className="ui-text-muted m-0 rounded-md bg-black/30 p-3 text-center text-sm">{preview.title}</p>
  }

  return (
    <div className="relative grid gap-2.5">
      <p className="m-0 text-center text-sm font-semibold text-white/75">{preview.title}</p>
      <div className={`grid gap-2 ${preview.outcomes.length === 2 ? 'grid-cols-2' : preview.outcomes.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
        {preview.outcomes.map((outcome) => {
          const key = selectionKey(outcome.conditionId, outcome.outcomeId)
          const isSelected = selectedOutcomes.has(key)
          const isDisabled = outcome.conditionState !== 'Active' || !Number.isFinite(outcome.odds) || outcome.odds <= 1

          return (
            <button
              key={key}
              aria-disabled={isDisabled}
              className={`flex min-h-14 min-w-0 flex-col items-center justify-center rounded-md border px-2 py-2 text-center text-sm transition ${
                isDisabled
                  ? 'ui-preview-chip-disabled cursor-not-allowed'
                  : isSelected
                    ? 'ui-preview-chip-active'
                    : 'ui-preview-chip !border-white/15 !bg-white/[0.08] hover:!border-white/25 hover:!bg-white/[0.12]'
              }`}
              onClick={() => {
                if (isDisabled) return
                onSelectOutcome(outcome)
              }}
              type="button"
            >
              <span className="ui-text-muted block w-full truncate text-xs leading-tight">{truncateLabel(normalizeOutcomeLabel(outcome.selectionName, game.participants), 12)}</span>
              <strong className="ui-text-strong mt-1 block tabular-nums text-lg leading-none">{Number.isFinite(outcome.odds) ? outcome.odds.toFixed(2) : '0.00'}</strong>
            </button>
          )
        })}
      </div>
    </div>
  )
}
