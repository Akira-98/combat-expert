import { useEffect, useState } from 'react'
import type { Address } from 'viem'
import { createPickShare } from '../api/pickShares'
import { shareOrCopyUrl } from '../helpers/share'

const SHARE_MESSAGE_TIMEOUT_MS = 3000

type ShareMessage = 'copied' | 'shared' | 'failed'

type BetslipItem = {
  conditionId: string
  outcomeId: string
  gameId: string
  isExpressForbidden?: boolean
}

type SelectionItem = {
  conditionId: string
  outcomeId: string
  gameTitle: string
  label: string
  odds: number
}

function buildPickShareSelections(items: BetslipItem[], selectionItems: SelectionItem[]) {
  return items.map((item) => {
    const displayItem = selectionItems.find(
      (selection) => selection.conditionId === item.conditionId && selection.outcomeId === item.outcomeId,
    )

    return {
      conditionId: item.conditionId,
      outcomeId: item.outcomeId,
      gameId: item.gameId,
      isExpressForbidden: Boolean(item.isExpressForbidden),
      gameTitle: displayItem?.gameTitle,
      label: displayItem?.label,
      odds: displayItem?.odds,
    }
  })
}

export function useShareBetslip({
  address,
  items,
  selectionItems,
}: {
  address?: Address
  items: BetslipItem[]
  selectionItems: SelectionItem[]
}) {
  const [shareState, setShareState] = useState<{ isPending: boolean; message?: ShareMessage }>({ isPending: false })

  useEffect(() => {
    if (!shareState.message) return

    const timeoutId = window.setTimeout(() => {
      setShareState((current) => current.message === shareState.message ? { isPending: false } : current)
    }, SHARE_MESSAGE_TIMEOUT_MS)

    return () => window.clearTimeout(timeoutId)
  }, [shareState.message])

  const shareBetslip = async () => {
    if (!address || items.length === 0) return

    setShareState({ isPending: true })

    try {
      const result = await createPickShare({
        sharerWallet: address,
        selections: buildPickShareSelections(items, selectionItems),
      })

      const resultStatus = await shareOrCopyUrl({
        title: 'BETAKER picks',
        text: 'Check out this BETAKER betslip.',
        url: result.shareUrl,
      })
      setShareState(resultStatus === 'aborted'
        ? { isPending: false }
        : { isPending: false, message: resultStatus })
    } catch (error) {
      console.warn('Failed to create pick share', error)
      setShareState({ isPending: false, message: 'failed' })
    }
  }

  return {
    shareBetslip,
    sharePending: shareState.isPending,
    shareMessage: shareState.message,
  }
}
