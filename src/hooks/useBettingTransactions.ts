import { useBet, useBetTokenBalance } from '@azuro-org/sdk'
import type { Address } from 'viem'
import { getFriendlyTransactionErrorMessage } from '../helpers/betslipUi'
import { useAppConfig } from '../config/useAppConfig'
import { useBetHistory } from './useBetHistory'
import { useBetRedeem } from './useBetRedeem'
import { useBetSettlementSync } from './useBetSettlementSync'
import { useTransactionNotice } from './useTransactionNotice'
import { translate } from '../i18n'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

type UseBettingTransactionsParams = {
  address?: Address
  isConnected: boolean
  isBetHistoryPollingEnabled: boolean
  items: {
    conditionId: string
    outcomeId: string
    gameId: string
  }[]
  betAmount: string
  odds: Record<string, number>
  totalOdds: number
  slippage: number
  onBetSuccess: (receiptHash?: `0x${string}`) => void
}

export function useBettingTransactions({
  address,
  isConnected,
  isBetHistoryPollingEnabled,
  items,
  betAmount,
  odds,
  totalOdds,
  slippage,
  onBetSuccess,
}: UseBettingTransactionsParams) {
  const { transactionNotice, clearTransactionNotice, setSuccessNotice, setErrorNotice } = useTransactionNotice({
    mapErrorMessage: getFriendlyTransactionErrorMessage,
  })
  const { affiliateAddress: affiliateAddressFromConfig } = useAppConfig()
  const affiliateAddress = (affiliateAddressFromConfig || ZERO_ADDRESS) as Address
  const { data: betTokenBalanceData, isLoading: isBalanceLoading, refetch: refetchBetTokenBalance } = useBetTokenBalance({
    query: {
      enabled: isConnected,
      refetchOnWindowFocus: true,
    },
  })

  const { submit, isApproveRequired, approveTx, betTx } = useBet({
    betAmount: betAmount || '1',
    slippage,
    affiliate: affiliateAddress,
    selections: items,
    odds,
    totalOdds,
    onSuccess: (receipt) => {
      onBetSuccess(receipt?.transactionHash)
      void refetchBetTokenBalance()
      setSuccessNotice({
        title: translate('betting.betSuccessTitle'),
        message: translate('betting.betSuccessMessage'),
        txHash: receipt?.transactionHash,
      })
    },
    onError: (error) => setErrorNotice({ title: translate('betting.betErrorTitle'), error }),
  })

  const { bets } = useBetHistory({ address, isPollingEnabled: isBetHistoryPollingEnabled })
  const { betSettlementSyncStateByTokenId } = useBetSettlementSync({
    bets,
    enabled: Boolean(address),
  })
  const { redeemingBetTokenId, redeemPending, redeemBet } = useBetRedeem({
    onBeforeSubmit: clearTransactionNotice,
    onSuccess: (txHash) => {
      void refetchBetTokenBalance()
      setSuccessNotice({
        title: translate('betting.redeemSuccessTitle'),
        message: translate('betting.redeemSuccessMessage'),
        txHash,
      })
    },
    onError: (error) => setErrorNotice({ title: translate('betting.redeemErrorTitle'), error }),
  })

  return {
    bets,
    betTokenBalanceData,
    isBalanceLoading,
    transactionNotice,
    clearTransactionNotice,
    setErrorNotice,
    submit,
    isApproveRequired,
    approveTx,
    betTx,
    betSettlementSyncStateByTokenId,
    redeemingBetTokenId,
    redeemPending,
    redeemBet,
  }
}
