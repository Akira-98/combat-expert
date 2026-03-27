import { useEffect, useState } from 'react'

function readHiddenBetTokenIds(storageKey: string | undefined) {
  if (!storageKey || typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((tokenId): tokenId is string => typeof tokenId === 'string')
  } catch {
    return []
  }
}

export function useHiddenBets(storageKey: string | undefined) {
  const [hiddenBetTokenIds, setHiddenBetTokenIds] = useState<string[]>(() => readHiddenBetTokenIds(storageKey))

  useEffect(() => {
    setHiddenBetTokenIds(readHiddenBetTokenIds(storageKey))
  }, [storageKey])

  const hideBet = (tokenId: string) => {
    if (!storageKey) return

    setHiddenBetTokenIds((current) => {
      if (current.includes(tokenId)) return current

      const nextTokenIds = [...current, tokenId]
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, JSON.stringify(nextTokenIds))
      }

      return nextTokenIds
    })
  }

  return {
    hiddenBetTokenIds,
    hideBet,
  }
}
