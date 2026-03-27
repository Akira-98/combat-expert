import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../../i18n'
import { selectionKey } from '../../helpers/mappers'
import { mapMarketsToSections } from '../../helpers/mappers'
import type { OutcomeItem, SelectionKey } from '../../types/ui'
import { normalizeOutcomeLabel, outcomePreviewPriority, truncateLabel } from './helpers'
import { useMarketManagerConditions } from '../../hooks/useMarketManagerConditions'

type GameOddsPreviewProps = {
  gameId: string
  participants: string[]
  priority?: boolean
  className?: string
  selectedOutcomes: Set<SelectionKey>
  onSelectOutcome: (outcome: OutcomeItem) => void
}

function usePrefetchOnVisible(priority: boolean) {
  const anchorRef = useRef<HTMLDivElement | null>(null)
  const [hasEnteredViewport, setHasEnteredViewport] = useState(priority)

  useEffect(() => {
    if (priority) return

    const node = anchorRef.current
    if (!node || hasEnteredViewport || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (!entry?.isIntersecting) return
        setHasEnteredViewport(true)
        observer.disconnect()
      },
      { rootMargin: '160px 0px' },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [hasEnteredViewport, priority])

  return { anchorRef, hasEnteredViewport }
}

export function GameOddsPreview({
  gameId,
  participants,
  priority = false,
  className = 'mt-2',
  selectedOutcomes,
  onSelectOutcome,
}: GameOddsPreviewProps) {
  const { t } = useI18n()
  const { anchorRef, hasEnteredViewport } = usePrefetchOnVisible(priority)
  const shouldFetchPreview = Boolean(gameId) && hasEnteredViewport
  const { data: markets, isLoading, isError } = useMarketManagerConditions({
    gameIds: gameId ? [gameId] : [],
    enabled: shouldFetchPreview,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  })

  const previewItems = useMemo(() => {
    const sections = mapMarketsToSections(markets ?? [])
    const firstMeaningful = sections.find((section) => section.outcomes.length > 0)
    if (!firstMeaningful) return []
    return [...firstMeaningful.outcomes]
      .sort((a, b) => {
        const byPriority = outcomePreviewPriority(a.selectionName) - outcomePreviewPriority(b.selectionName)
        if (byPriority !== 0) return byPriority
        return a.selectionName.localeCompare(b.selectionName)
      })
      .slice(0, 3)
      .map((outcome) => ({
        key: `${outcome.conditionId}-${outcome.outcomeId}`,
        label: truncateLabel(normalizeOutcomeLabel(outcome.selectionName, participants)),
        odds: Number.isFinite(outcome.odds) ? outcome.odds.toFixed(2) : '0.00',
        outcome,
        isSelected: selectedOutcomes.has(selectionKey(outcome.conditionId, outcome.outcomeId)),
        isDisabled: outcome.conditionState !== 'Active' || !Number.isFinite(outcome.odds) || outcome.odds <= 1,
      }))
  }, [markets, participants, selectedOutcomes])

  if (!hasEnteredViewport) {
    return <div ref={anchorRef} className={`${className} h-5`} aria-hidden />
  }

  if (isLoading) {
    return (
      <div ref={anchorRef} className={`${className} ui-text-muted text-xs`}>
        {t('market.previewLoading')}
      </div>
    )
  }

  if (isError) {
    return (
      <div ref={anchorRef} className={`${className} ui-text-danger text-xs`}>
        {t('market.previewError')}
      </div>
    )
  }

  if (previewItems.length === 0) {
    return (
      <div ref={anchorRef} className={`${className} ui-text-muted text-xs`}>
        {t('market.previewEmpty')}
      </div>
    )
  }

  return (
    <div ref={anchorRef} className={`${className} flex flex-wrap gap-1.5`}>
      {previewItems.map((item) => (
        <button
          key={item.key}
          aria-disabled={item.isDisabled}
          className={`chip-shell inline-flex gap-1 px-2 py-1 text-[11px] transition ${
            item.isDisabled
              ? 'ui-preview-chip-disabled cursor-not-allowed'
              : item.isSelected
                ? 'ui-preview-chip-active'
                : 'ui-preview-chip'
          }`}
          onClick={(event) => {
            event.stopPropagation()
            if (item.isDisabled) return
            onSelectOutcome(item.outcome)
          }}
          type="button"
        >
          <span className={item.isDisabled ? 'ui-text-muted' : 'ui-text-muted'}>{item.label}</span>
          <strong className={item.isDisabled ? 'ui-text-muted' : item.isSelected ? 'ui-text-success' : 'ui-text-strong'}>
            {item.odds}
          </strong>
        </button>
      ))}
    </div>
  )
}
