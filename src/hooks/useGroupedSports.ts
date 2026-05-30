import { useMemo } from 'react'
import type { SportFilterItem } from '../types/ui'

export function useGroupedSports(sports: SportFilterItem[]) {
  return useMemo(
    () => ({
      sports: sports.filter((sport) => sport.hub !== 'esports'),
      esports: sports.filter((sport) => sport.hub === 'esports'),
    }),
    [sports],
  )
}
