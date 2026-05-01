import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchFightersByNames } from '../api/fighters'

function normalizeFighterName(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function normalizeFighterNameKey(value: string) {
  return normalizeFighterName(value).toLocaleLowerCase()
}

export function useFighterImages(names: string[]) {
  const normalizedNames = useMemo(
    () => [...new Set(names.map(normalizeFighterName).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [names],
  )

  const query = useQuery({
    queryKey: ['fighter-images', normalizedNames],
    queryFn: () => fetchFightersByNames(normalizedNames),
    enabled: normalizedNames.length > 0,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  })

  const imageUrlByName = useMemo(() => {
    const map = new Map<string, string>()

    for (const fighter of query.data ?? []) {
      if (fighter.azuroName && fighter.imageUrl) {
        map.set(normalizeFighterNameKey(fighter.azuroName), fighter.imageUrl)
      }
    }

    return map
  }, [query.data])

  return {
    ...query,
    imageUrlByName,
    getImageUrlByName: (name: string) => imageUrlByName.get(normalizeFighterNameKey(name)),
  }
}
