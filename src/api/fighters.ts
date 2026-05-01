import { getJson } from './http'

export type FighterImage = {
  azuroName: string
  imagePath: string | null
  imageUrl: string | null
}

export async function fetchFightersByNames(names: string[]): Promise<FighterImage[]> {
  const params = new URLSearchParams()

  for (const name of names) {
    const normalizedName = name.trim().replace(/\s+/g, ' ')
    if (normalizedName) params.append('names', normalizedName)
  }

  if (!params.toString()) return []

  const payload = await getJson(`/api/fighters?${params.toString()}`, 'Failed to load fighters')
  const fightersPayload = payload && typeof payload === 'object' ? payload as { fighters?: unknown } : {}

  return Array.isArray(fightersPayload.fighters) ? fightersPayload.fighters as FighterImage[] : []
}
