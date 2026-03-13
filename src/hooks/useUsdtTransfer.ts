import { useMemo, useState } from 'react'
import { erc20Abi, encodeFunctionData, isAddress, parseUnits } from 'viem'
import { polygon } from 'viem/chains'
import { useTransactionNotice } from './useTransactionNotice'
import { DEFAULT_USDT_CONFIG, getErc20TokenConfig } from '../config/tokens'
import { useAAWalletClient } from '../azuroSocialAaConnector'
import { withPrivySendTransactionUi } from '../helpers/privyUi'
import { useUsdtBalance } from './useUsdtBalance'

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
    return '지갑에서 전송 요청이 거부되었습니다.'
  }
  if (lower.includes('insufficient')) {
    return '잔액 또는 가스비가 부족합니다.'
  }
  if (lower.includes('network') || lower.includes('chain')) {
    return '네트워크가 올바르지 않거나 RPC 상태가 불안정합니다.'
  }
  if (lower.includes('sponsor') || lower.includes('paymaster')) {
    return '가스비 대납 조건을 충족하지 못했습니다. 정책/한도를 확인해 주세요.'
  }

  return '송금 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
}

export function useUsdtTransfer({ address, chainId, isConnected, isAAWallet }: UseUsdtTransferParams) {
  const aaWalletClient = useAAWalletClient()
  const [recipient, setRecipient] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [isSending, setIsSending] = useState(false)
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
    if (!isConnected) return '지갑을 먼저 연결해 주세요.'
    if (!isAAWallet) return '현재 송금 기능은 스마트월렛 기준으로 안내됩니다.'
    if (!aaWalletClient) return '스마트월렛 초기화 중입니다. 잠시 후 다시 시도해 주세요.'
    if (!isSupportedChain) return 'USDT 송금은 Polygon Mainnet에서만 지원됩니다.'
    if (!recipientTrimmed) return '수신 주소를 입력해 주세요.'
    if (!isRecipientValid) return '수신 주소 형식이 올바르지 않습니다.'
    if (!amountInput.trim()) return '송금 금액을 입력해 주세요.'
    if (!Number.isFinite(amountNum)) return '송금 금액은 숫자로 입력해 주세요.'
    if (!(amountNum > 0)) return '송금 금액은 0보다 커야 합니다.'
    if (!isAmountWithinBalance) return 'USDT 잔액이 부족합니다.'
    return undefined
  }, [aaWalletClient, amountInput, amountNum, isAAWallet, isAmountWithinBalance, isConnected, isRecipientValid, isSupportedChain, recipientTrimmed])

  const canSend = !isSending && !validationMessage && Boolean(usdtConfig && tokenAddress && address && aaWalletClient)

  const setMaxAmount = () => {
    setAmountInput(balance > 0 ? String(balance) : '0')
  }

  const sendUsdt = async () => {
    if (!canSend || !address || !tokenAddress || !usdtConfig || !aaWalletClient) return

    setIsSending(true)
    clearTransactionNotice()

    try {
      const value = parseUnits(amountInput, tokenDecimals)
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [recipientTrimmed as `0x${string}`, value],
      })

      const result = await aaWalletClient.sendTransaction({
        to: tokenAddress,
        data,
        value: 0n,
        chain: polygon,
      }, withPrivySendTransactionUi())
      const txHash = typeof result === 'string' ? result : (result as { hash?: `0x${string}` } | undefined)?.hash

      setSuccessNotice({
        title: 'USDT 송금 요청 완료',
        message: 'USDT 송금 트랜잭션이 전송되었습니다.',
        txHash,
      })
      setAmountInput('')
      void refetchBalance()
    } catch (error) {
      setErrorNotice({ title: 'USDT 송금 실패', error })
    } finally {
      setIsSending(false)
    }
  }

  return {
    tokenAddress,
    balance,
    isBalanceLoading,
    isSupportedChain,
    recipient,
    amountInput,
    isSending,
    validationMessage,
    canSend,
    transactionNotice,
    setRecipient,
    setAmountInput,
    setMaxAmount,
    sendUsdt,
  }
}
