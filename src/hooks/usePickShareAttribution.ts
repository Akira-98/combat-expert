import { useEffect, useState } from 'react'
import { fetchPickShare } from '../api/pickShares'

const PICK_SHARE_ROUTE_PREFIX = '/share/picks/'
const ACTIVE_PICK_SHARE_STORAGE_KEY = 'betaker.activePickShareId'

type BetslipSelection = {
  conditionId: string
  outcomeId: string
  gameId: string
  isExpressForbidden: boolean
}

type SharedSelectionMeta = {
  conditionId: string
  outcomeId: string
  gameId?: string
  isExpressForbidden?: boolean
  gameTitle?: string
  label?: string
  odds?: number
  marketTitle?: string
  selectionName?: string
}

type UsePickShareAttributionParams = {
  addItem: (item: BetslipSelection) => void
  clear: () => void
  rememberSharedSelectionMeta: (items: SharedSelectionMeta[]) => void
  resetSelectionMeta: () => void
  onPickShareGameSelected?: (gameId: string) => void
}

function getPickShareIdFromLocation(location: Location) {
  const pathname = location.pathname
  if (pathname.startsWith(PICK_SHARE_ROUTE_PREFIX)) {
    const encodedShareId = pathname.slice(PICK_SHARE_ROUTE_PREFIX.length).split('/')[0]
    return encodedShareId ? decodeURIComponent(encodedShareId) : ''
  }

  return new URLSearchParams(location.search).get('shareId') || ''
}

function getStoredPickShareId() {
  if (typeof window === 'undefined') return undefined
  return window.localStorage.getItem(ACTIVE_PICK_SHARE_STORAGE_KEY) || undefined
}

export function usePickShareAttribution({
  addItem,
  clear,
  rememberSharedSelectionMeta,
  resetSelectionMeta,
  onPickShareGameSelected,
}: UsePickShareAttributionParams) {
  const [activePickShareId, setActivePickShareId] = useState<string | undefined>(getStoredPickShareId)

  const clearPickShareAttribution = () => {
    setActivePickShareId(undefined)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ACTIVE_PICK_SHARE_STORAGE_KEY)
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const shareId = getPickShareIdFromLocation(window.location)
    if (!shareId) return

    let isCanceled = false

    void fetchPickShare(shareId)
      .then((share) => {
        if (isCanceled) return

        clear()
        resetSelectionMeta()
        rememberSharedSelectionMeta(share.selections)
        const sharedGameId = share.selections.find((selection) => selection.gameId)?.gameId
        if (sharedGameId) {
          onPickShareGameSelected?.(sharedGameId)
        }
        for (const selection of share.selections) {
          addItem({
            conditionId: selection.conditionId,
            outcomeId: selection.outcomeId,
            gameId: selection.gameId,
            isExpressForbidden: Boolean(selection.isExpressForbidden),
          })
        }

        setActivePickShareId(share.id)
        window.localStorage.setItem(ACTIVE_PICK_SHARE_STORAGE_KEY, share.id)
        window.history.replaceState({}, '', '/')
      })
      .catch((error) => {
        console.warn('Failed to load pick share', error)
      })

    return () => {
      isCanceled = true
    }
  }, [addItem, clear, onPickShareGameSelected, rememberSharedSelectionMeta, resetSelectionMeta])

  return {
    activePickShareId,
    clearPickShareAttribution,
  }
}
