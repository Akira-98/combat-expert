import { useEffect, useMemo, useRef, useState } from 'react'
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
      <div ref={anchorRef} className={`${className} text-xs text-slate-400`}>
        배당 불러오는 중...
      </div>
    )
  }

  if (isError) {
    return (
      <div ref={anchorRef} className={`${className} text-xs text-rose-500`}>
        배당 로드 실패
      </div>
    )
  }

  if (previewItems.length === 0) {
    return (
      <div ref={anchorRef} className={`${className} text-xs text-slate-400`}>
        배당 정보 없음
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
              ? 'cursor-not-allowed border-slate-200/40 bg-[color:color-mix(in_oklab,var(--app-surface-soft)_86%,transparent)] text-slate-400'
              : item.isSelected
                ? 'border-emerald-300/70 bg-[color:color-mix(in_oklab,var(--state-success-soft)_70%,var(--app-surface))] text-emerald-200'
                : 'border-slate-200/40 bg-[color:color-mix(in_oklab,var(--app-surface-soft)_84%,transparent)] text-slate-300 hover:border-slate-300/70 hover:bg-[color:color-mix(in_oklab,var(--app-surface-soft)_95%,transparent)]'
          }`}
          onClick={(event) => {
            event.stopPropagation()
            if (item.isDisabled) return
            onSelectOutcome(item.outcome)
          }}
          type="button"
        >
          <span className="text-slate-400">{item.label}</span>
          <strong className={item.isDisabled ? 'text-slate-400' : item.isSelected ? 'text-emerald-100' : 'text-slate-100'}>
            {item.odds}
          </strong>
        </button>
      ))}
    </div>
  )
}
