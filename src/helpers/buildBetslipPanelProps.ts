import type { BetslipPanelProps } from '../compositions/BetslipPanel'
import type { useWalletConnection } from '../hooks/useWalletConnection'
import type { useBetting } from '../hooks/useBetting'

export function buildBetslipPanelProps({
  wallet,
  betting,
}: {
  wallet: ReturnType<typeof useWalletConnection>
  betting: ReturnType<typeof useBetting>
}): BetslipPanelProps {
  return {
    wallet: {
      isConnected: wallet.isConnected,
      canConnectWallet: wallet.canOpenAuthModal,
      isConnectingWallet: wallet.isConnecting,
      chainId: wallet.chainId,
    },
    bet: {
      selections: betting.selectionItems,
      betAmount: betting.betAmount,
      slippage: betting.slippage,
      totalOdds: betting.totalOdds,
      possibleWin: betting.possibleWin,
      canBet: betting.canBet,
      isApproveRequired: betting.isApproveRequired,
      approvePending: betting.approvePending,
      betPending: betting.betPending,
      disableReason: betting.disableReason,
      uiBlockHint: betting.uiBlockHint,
      submitLabel: betting.submitLabel,
      minBet: betting.minBet,
      maxBet: betting.maxBet,
      tokenBalance: betting.tokenBalance,
      isBalanceLoading: betting.isBalanceLoading,
      isLimitsLoading: betting.isLimitsLoading,
      amountValidationMessage: betting.amountValidationMessage,
      transactionSteps: betting.transactionSteps,
      transactionNotice: betting.transactionNotice,
    },
    actions: {
      onConnectWallet: wallet.openAuthModal,
      onBetAmountChange: betting.setBetAmount,
      onSlippageChange: betting.setSlippage,
      onSubmit: betting.submitBet,
      onClear: betting.clearBetslip,
      onDismissTransactionNotice: betting.clearTransactionNotice,
      onRemoveSelection: betting.removeSelection,
    },
  }
}
