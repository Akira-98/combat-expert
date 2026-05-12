import { useEffect, useRef, useState } from 'react'
import type { Address } from 'viem'
import { useBaseBetslip, useDetailedBetslip } from '@azuro-org/sdk'
import { createPickShare, fetchPickShare } from '../api/pickShares'
import type { GameItem, MarketSection, OutcomeItem } from '../types/ui'
import { buildBettingDerivedState, clampSlippage } from './useBetting.helpers'
import { useBetSubmission } from './useBetSubmission'
import { useBettingSelectionState } from './useBettingSelectionState'
import { useBettingTransactions } from './useBettingTransactions'

const DEFAULT_SLIPPAGE = 3
const PICK_SHARE_ROUTE_PREFIX = '/share/picks/'
const ACTIVE_PICK_SHARE_STORAGE_KEY = 'betaker.activePickShareId'
const LEGACY_ACTIVE_REFERRAL_SHARE_STORAGE_KEY = 'betaker.activeReferralShareId'
const SHARE_MESSAGE_TIMEOUT_MS = 3000

type ShareMessage = 'copied' | 'shared' | 'failed'

type UseBettingParams = {
  address?: Address
  isConnected: boolean
  games: GameItem[]
  marketSections: MarketSection[]
  isBetHistoryPollingEnabled?: boolean
  refreshMarkets?: () => void
  onPickShareGameSelected?: (gameId: string) => void
  onBetPointsClaimed?: () => void
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  try {
    const didCopy = document.execCommand('copy')
    if (!didCopy) throw new Error('Copy command was rejected.')
  } finally {
    document.body.removeChild(textarea)
  }
}

function isShareAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}

function getPickShareIdFromLocation(location: Location) {
  const pathname = location.pathname
  if (pathname.startsWith(PICK_SHARE_ROUTE_PREFIX)) {
    const encodedShareId = pathname.slice(PICK_SHARE_ROUTE_PREFIX.length).split('/')[0]
    return encodedShareId ? decodeURIComponent(encodedShareId) : ''
  }

  return new URLSearchParams(location.search).get('shareId') || ''
}

function buildPickShareSelections(
  items: { conditionId: string; outcomeId: string; gameId: string; isExpressForbidden?: boolean }[],
  selectionItems: { conditionId: string; outcomeId: string; gameTitle: string; label: string; odds: number }[],
) {
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

export function useBetting({
  address,
  isConnected,
  games,
  marketSections,
  isBetHistoryPollingEnabled = false,
  refreshMarkets,
  onPickShareGameSelected,
  onBetPointsClaimed,
}: UseBettingParams) {
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE)
  const [activePickShareId, setActivePickShareId] = useState<string | undefined>(() => {
    if (typeof window === 'undefined') return undefined
    return window.localStorage.getItem(ACTIVE_PICK_SHARE_STORAGE_KEY)
      || window.localStorage.getItem(LEGACY_ACTIVE_REFERRAL_SHARE_STORAGE_KEY)
      || undefined
  })
  const [shareState, setShareState] = useState<{ isPending: boolean; message?: ShareMessage }>({ isPending: false })
  const { items, addItem, clear, removeItem } = useBaseBetslip()
  const {
    betAmount,
    changeBetAmount,
    odds,
    totalOdds,
    disableReason,
    minBet,
    maxBet,
    isMaxBetFetching,
  } = useDetailedBetslip()
  const selectionState = useBettingSelectionState({
    items,
    games,
    marketSections,
    disableReason,
    totalOdds,
  })
  const transactions = useBettingTransactions({
    address,
    isConnected,
    isBetHistoryPollingEnabled,
    items,
    betAmount,
    odds,
    totalOdds,
    slippage,
    activePickShareId,
    onBetPointsClaimed,
    onPickSharePointsAwarded: () => {
      setActivePickShareId(undefined)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(ACTIVE_PICK_SHARE_STORAGE_KEY)
        window.localStorage.removeItem(LEGACY_ACTIVE_REFERRAL_SHARE_STORAGE_KEY)
      }
    },
    onBetSuccess: () => {
      clear()
      selectionState.resetSelectionMeta()
    },
  })
  const mismatchHandledRef = useRef(false)

  useEffect(() => {
    if (!shareState.message) return

    const timeoutId = window.setTimeout(() => {
      setShareState((current) => current.message === shareState.message ? { isPending: false } : current)
    }, SHARE_MESSAGE_TIMEOUT_MS)

    return () => window.clearTimeout(timeoutId)
  }, [shareState.message])

  useEffect(() => {
    if (!selectionState.sdkConditionStateMismatch) {
      mismatchHandledRef.current = false
      return
    }
    if (mismatchHandledRef.current) return
    mismatchHandledRef.current = true
    refreshMarkets?.()
  }, [refreshMarkets, selectionState.sdkConditionStateMismatch])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const shareId = getPickShareIdFromLocation(window.location)
    if (!shareId) return

    let isCanceled = false

    void fetchPickShare(shareId)
      .then((share) => {
        if (isCanceled) return

        clear()
        selectionState.resetSelectionMeta()
        selectionState.rememberSharedSelectionMeta(share.selections)
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
        window.localStorage.removeItem(LEGACY_ACTIVE_REFERRAL_SHARE_STORAGE_KEY)
        window.history.replaceState({}, '', '/')
      })
      .catch((error) => {
        console.warn('Failed to load pick share', error)
      })

    return () => {
      isCanceled = true
    }
  }, [addItem, clear, onPickShareGameSelected, selectionState])

  const approvePending = transactions.approveTx.isPending || transactions.approveTx.isProcessing
  const betPending = transactions.betTx.isPending || transactions.betTx.isProcessing
  const { tokenBalance, possibleWin, canBet, amountValidationMessage, uiBlockHint, submitLabel, transactionSteps } =
    buildBettingDerivedState({
      betAmount,
      totalOdds,
      tokenBalanceRaw: transactions.betTokenBalanceData?.balance,
      minBet,
      maxBet,
      isConnected,
      itemCount: items.length,
      isBetAllowed: selectionState.uiSelectionAllowed,
      disableReason: selectionState.displayDisableReason,
      isApproveRequired: transactions.isApproveRequired,
      approvePending,
      betPending,
      approveTxPending: transactions.approveTx.isPending,
      betTxPending: transactions.betTx.isPending,
      betReceiptReady: Boolean(transactions.betTx.receipt),
    })

  const selectOutcome = (outcome: OutcomeItem) => {
    selectionState.rememberSelectionMeta(outcome)
    addItem({
      conditionId: outcome.conditionId,
      outcomeId: outcome.outcomeId,
      gameId: outcome.gameId,
      isExpressForbidden: outcome.isExpressForbidden,
    })
  }

  const shareBetslip = async () => {
    if (!address || items.length === 0) return

    setShareState({ isPending: true })

    try {
      const result = await createPickShare({
        sharerWallet: address,
        selections: buildPickShareSelections(items, selectionState.selectionItems),
      })

      if (navigator.share) {
        const shareData: ShareData = {
          title: 'BETAKER picks',
          text: 'Check out this BETAKER betslip.',
          url: result.shareUrl,
        }
        const urlOnlyShareData: ShareData = { url: result.shareUrl }
        const nativeShareData = !navigator.canShare || navigator.canShare(shareData)
          ? shareData
          : navigator.canShare(urlOnlyShareData)
            ? urlOnlyShareData
            : undefined

        if (nativeShareData) {
          try {
            await navigator.share(nativeShareData)
            setShareState({ isPending: false, message: 'shared' })
            return
          } catch (error) {
            if (isShareAbortError(error)) {
              setShareState({ isPending: false })
              return
            }
          }
        }
      }

      await copyTextToClipboard(result.shareUrl)
      setShareState({ isPending: false, message: 'copied' })
    } catch (error) {
      console.warn('Failed to create pick share', error)
      setShareState({ isPending: false, message: 'failed' })
    }
  }
  const submitBet = useBetSubmission({
    items,
    currentOutcomeStateMap: selectionState.currentOutcomeStateMap,
    selectedOutcomePriceChanges: selectionState.selectedOutcomePriceChanges,
    sdkConditionStateMismatch: selectionState.sdkConditionStateMismatch,
    clearTransactionNotice: transactions.clearTransactionNotice,
    setErrorNotice: transactions.setErrorNotice,
    syncSelectionMeta: selectionState.syncSelectionMeta,
    submit: transactions.submit,
  })

  return {
    bets: transactions.bets,
    selectedOutcomes: selectionState.selectedOutcomes,
    selectedOutcomePriceChanges: selectionState.selectedOutcomePriceChanges,
    selectionItems: selectionState.selectionItems,
    betAmount,
    totalOdds,
    possibleWin,
    canBet,
    isApproveRequired: transactions.isApproveRequired,
    approvePending,
    betPending,
    disableReason: selectionState.displayDisableReason,
    minBet,
    maxBet,
    tokenBalance,
    isBalanceLoading: transactions.isBalanceLoading,
    isLimitsLoading: isMaxBetFetching,
    amountValidationMessage,
    slippage,
    uiBlockHint,
    submitLabel,
    sharePending: shareState.isPending,
    shareMessage: shareState.message,
    selectOutcome,
    shareBetslip,
    setBetAmount: changeBetAmount,
    setSlippage: (value: number) => {
      const next = clampSlippage(value)
      if (next === undefined) return
      setSlippage(next)
    },
    transactionSteps,
    transactionNotice: transactions.transactionNotice,
    redeemingBetTokenId: transactions.redeemingBetTokenId,
    redeemPending: transactions.redeemPending,
    clearTransactionNotice: transactions.clearTransactionNotice,
    submitBet,
    betSettlementSyncStateByTokenId: transactions.betSettlementSyncStateByTokenId,
    clearBetslip: () => {
      clear()
      selectionState.resetSelectionMeta()
    },
    redeemBet: transactions.redeemBet,
    removeSelection: ({ conditionId, outcomeId }: { conditionId: string; outcomeId: string }) => {
      removeItem({ conditionId, outcomeId })
      selectionState.removeSelectionMeta(conditionId, outcomeId)
    },
  }
}
