import { useMemo } from 'react'
import type { SportNavigationItem } from '../types/ui'

export function useGroupedSports(sports: SportNavigationItem[]) {
  return useMemo(
    () => ({
      sports: sports.filter((sport) => sport.hub !== 'esports'),
      esports: sports.filter((sport) => sport.hub === 'esports'),
    }),
    [sports],
  )
}
