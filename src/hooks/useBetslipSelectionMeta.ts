import { useMemo, useState } from 'react'
import type { MarketSection, OutcomeItem, SelectionKey } from '../types/ui'
import { buildOutcomeMeta, selectionKey } from '../helpers/mappers'

type SelectionMeta = {
  label: string
  odds: number
}

export function useBetslipSelectionMeta(params: { marketSections: MarketSection[]; selectedOutcomes: Set<SelectionKey> }) {
  const { marketSections, selectedOutcomes } = params
  const [selectionMetaCache, setSelectionMetaCache] = useState<Map<SelectionKey, SelectionMeta>>(new Map())

  const outcomeMeta = useMemo(() => buildOutcomeMeta(marketSections), [marketSections])

  const selectedOutcomePriceChanges = useMemo(() => {
    const changed = new Map<SelectionKey, { previousOdds: number; currentOdds: number }>()

    selectedOutcomes.forEach((key) => {
      const snapshot = selectionMetaCache.get(key)
      const current = outcomeMeta.get(key)
      if (!snapshot || !current) return
      if (!Number.isFinite(snapshot.odds) || !Number.isFinite(current.odds)) return
      if (Math.abs(snapshot.odds - current.odds) < 1e-9) return
      changed.set(key, { previousOdds: snapshot.odds, currentOdds: current.odds })
    })

    return changed
  }, [outcomeMeta, selectedOutcomes, selectionMetaCache])

  const mergedOutcomeMeta = useMemo(() => {
    const merged = new Map(selectionMetaCache)
    outcomeMeta.forEach((value, key) => {
      merged.set(key, value)
    })
    return merged
  }, [outcomeMeta, selectionMetaCache])

  const rememberSelectionMeta = (outcome: OutcomeItem) => {
    const key = selectionKey(outcome.conditionId, outcome.outcomeId)
    const meta = outcomeMeta.get(key)

    setSelectionMetaCache((prev) => {
      const next = new Map(prev)
      next.set(key, meta ?? { label: outcome.selectionName, odds: outcome.odds })
      return next
    })
  }

  const resetSelectionMeta = () => {
    setSelectionMetaCache(new Map())
  }

  const removeSelectionMeta = (conditionId: string, outcomeId: string) => {
    const key = selectionKey(conditionId, outcomeId)
    setSelectionMetaCache((prev) => {
      const next = new Map(prev)
      next.delete(key)
      return next
    })
  }

  return {
    mergedOutcomeMeta,
    selectedOutcomePriceChanges,
    rememberSelectionMeta,
    resetSelectionMeta,
    removeSelectionMeta,
  }
}
