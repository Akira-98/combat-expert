import { useEffect, useRef, useState } from 'react'
import type { BetslipPanelBetState, BetslipPanelWalletState } from '../compositions/BetslipPanel'
import { getDisableReasonLabel } from '../compositions/BetslipPanel/constants'

const TOTAL_ODDS_WARNING_DELAY_MS = 900

type UseBetslipPanelStateParams = {
  wallet: BetslipPanelWalletState
  bet: BetslipPanelBetState
  connectingWalletLabel: string
}

export function useBetslipPanelState({
  wallet,
  bet,
  connectingWalletLabel,
}: UseBetslipPanelStateParams) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [revealedDisableReasonKey, setRevealedDisableReasonKey] = useState<string | undefined>(undefined)
  const disableReasonText = bet.disableReason ? getDisableReasonLabel(bet.disableReason) : undefined
  const shouldDelayDisableReason = bet.disableReason === 'TotalOddsTooLow'
  const delayedDisableReasonKey =
    shouldDelayDisableReason && disableReasonText ? `${bet.disableReason}:${bet.selections.length}` : undefined
  const scheduledDisableReasonKeyRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!delayedDisableReasonKey) return

    scheduledDisableReasonKeyRef.current = delayedDisableReasonKey
    const timeoutId = window.setTimeout(() => {
      if (scheduledDisableReasonKeyRef.current !== delayedDisableReasonKey) return
      setRevealedDisableReasonKey(delayedDisableReasonKey)
    }, TOTAL_ODDS_WARNING_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [delayedDisableReasonKey])

  return {
    isSettingsOpen,
    visibleDisableReasonText:
      bet.selections.length === 0
        ? undefined
        : shouldDelayDisableReason
          ? revealedDisableReasonKey === delayedDisableReasonKey
            ? disableReasonText
            : undefined
          : disableReasonText,
    isPrimaryDisabled: wallet.isConnected
      ? !bet.canBet || bet.approvePending || bet.betPending
      : !wallet.canConnectWallet || wallet.isConnectingWallet,
    primaryButtonLabel:
      !wallet.isConnected && wallet.isConnectingWallet ? connectingWalletLabel : bet.submitLabel,
    toggleSettingsOpen: () => setIsSettingsOpen((open) => !open),
  }
}
