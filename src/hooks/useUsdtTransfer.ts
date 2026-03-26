import { useMemo, useState } from 'react'
import { erc20Abi, encodeFunctionData, isAddress, parseUnits } from 'viem'
import { polygon } from 'viem/chains'
import { useWalletClient } from 'wagmi'
import { useTransactionNotice } from './useTransactionNotice'
import { DEFAULT_USDT_CONFIG, getErc20TokenConfig } from '../config/tokens'
import { useAAWalletClient } from '../azuroSocialAaConnector'
import { withPrivySendTransactionUi } from '../helpers/privyUi'
import { useUsdtBalance } from './useUsdtBalance'
import { translate } from '../i18n'

type UseUsdtTransferParams = {
  address?: `0x${string}`
  chainId?: number
  isConnected: boolean
  isAAWallet?: boolean
}

const getTransferErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? '')
  const lower = message.toLowerCase()

  if (lower.includes('user rejected') || lower.includes('rejected') || lower.includes('denied')) {
    return translate('usdtTransfer.rejected')
  }
  if (lower.includes('insufficient')) {
    return translate('usdtTransfer.insufficient')
  }
  if (lower.includes('network') || lower.includes('chain')) {
    return translate('usdtTransfer.network')
  }
  if (lower.includes('sponsor') || lower.includes('paymaster')) {
    return translate('usdtTransfer.paymaster')
  }

  return translate('usdtTransfer.failed')
}

export function useUsdtTransfer({ address, chainId, isConnected, isAAWallet }: UseUsdtTransferParams) {
  const aaWalletClient = useAAWalletClient()
  const { data: walletClient } = useWalletClient()
  const [recipient, setRecipient] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [hasAttemptedSend, setHasAttemptedSend] = useState(false)
  const { transactionNotice, clearTransactionNotice, setSuccessNotice, setErrorNotice } = useTransactionNotice({
    mapErrorMessage: getTransferErrorMessage,
  })

  const usdtConfig = getErc20TokenConfig(chainId, 'USDT')
  const tokenDecimals = usdtConfig?.decimals ?? DEFAULT_USDT_CONFIG.decimals
  const { tokenAddress, balance, isLoading: isBalanceLoading, isSupportedChain, refetch: refetchBalance } = useUsdtBalance({
    address,
    chainId,
    isConnected,
  })

  const amountNum = Number(amountInput)
  const recipientTrimmed = recipient.trim()
  const isRecipientValid = isAddress(recipientTrimmed)
  const hasValidAmount = Number.isFinite(amountNum) && amountNum > 0
  const isAmountWithinBalance = hasValidAmount && amountNum <= balance

  const validationMessage = useMemo(() => {
    if (!isConnected) return translate('usdtTransfer.connectWallet')
    if (!isSupportedChain) return translate('usdtTransfer.onlyPolygon')
    if (isAAWallet && !aaWalletClient) return translate('usdtTransfer.initializingSmartWallet')
    if (!isAAWallet && !walletClient) return translate('usdtTransfer.initializingWallet')
    if (!recipientTrimmed) return translate('usdtTransfer.enterRecipient')
    if (!isRecipientValid) return translate('usdtTransfer.invalidRecipient')
    if (!amountInput.trim()) return translate('usdtTransfer.enterAmount')
    if (!Number.isFinite(amountNum)) return translate('usdtTransfer.amountNumber')
    if (!(amountNum > 0)) return translate('usdtTransfer.amountPositive')
    if (!isAmountWithinBalance) return translate('usdtTransfer.insufficientUsdt')
    return undefined
  }, [aaWalletClient, amountInput, amountNum, isAAWallet, isAmountWithinBalance, isConnected, isRecipientValid, isSupportedChain, recipientTrimmed, walletClient])

  const visibleValidationMessage = hasAttemptedSend ? validationMessage : undefined
  const canSend = !isSending && !validationMessage && Boolean(usdtConfig && tokenAddress && address && (isAAWallet ? aaWalletClient : walletClient))

  const setMaxAmount = () => {
    setAmountInput(balance > 0 ? String(balance) : '0')
  }

  const sendUsdt = async () => {
    setHasAttemptedSend(true)
    if (!canSend || !address || !tokenAddress || !usdtConfig) return

    setIsSending(true)
    clearTransactionNotice()

    try {
      const value = parseUnits(amountInput, tokenDecimals)
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [recipientTrimmed as `0x${string}`, value],
      })

      let txHash: `0x${string}` | undefined

      if (isAAWallet) {
        if (!aaWalletClient) throw new Error(translate('profile.noAaWalletClient'))

        const result = await aaWalletClient.sendTransaction(
          {
            to: tokenAddress,
            data,
            value: 0n,
            chain: polygon,
          },
          withPrivySendTransactionUi(),
        )

        txHash = typeof result === 'string' ? result : (result as { hash?: `0x${string}` } | undefined)?.hash
      } else {
        if (!walletClient) throw new Error(translate('profile.noSignWalletClient'))

        txHash = await walletClient.sendTransaction({
          account: address,
          to: tokenAddress,
          data,
          value: 0n,
          chain: polygon,
        })
      }

      setSuccessNotice({
        title: translate('usdtTransfer.requestComplete'),
        message: translate('usdtTransfer.requestSent'),
        txHash,
      })
      setHasAttemptedSend(false)
      setAmountInput('')
      void refetchBalance()
    } catch (error) {
      setErrorNotice({ title: translate('usdtTransfer.requestFailed'), error })
    } finally {
      setIsSending(false)
    }
  }

  return {
    tokenAddress,
    balance,
    isBalanceLoading,
    isSupportedChain,
    refetchBalance,
    recipient,
    amountInput,
    isSending,
    validationMessage: visibleValidationMessage,
    canSend,
    transactionNotice,
    setRecipient,
    setAmountInput,
    setMaxAmount,
    sendUsdt,
  }
}
