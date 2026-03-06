import { useState } from 'react'
import type { TransactionNotice } from '../helpers/betslipUi'

type UseTransactionNoticeParams = {
  mapErrorMessage?: (error: unknown) => string
}

const DEFAULT_ERROR_MESSAGE = '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'

export function useTransactionNotice({ mapErrorMessage }: UseTransactionNoticeParams = {}) {
  const [transactionNotice, setTransactionNotice] = useState<TransactionNotice | undefined>()

  const clearTransactionNotice = () => setTransactionNotice(undefined)

  const setSuccessNotice = ({
    title,
    message,
    txHash,
  }: {
    title: string
    message: string
    txHash?: `0x${string}`
  }) => {
    setTransactionNotice({
      type: 'success',
      title,
      message,
      txHash,
    })
  }

  const setErrorNotice = ({
    title,
    error,
    message,
  }: {
    title: string
    error?: unknown
    message?: string
  }) => {
    setTransactionNotice({
      type: 'error',
      title,
      message: message || (mapErrorMessage ? mapErrorMessage(error) : DEFAULT_ERROR_MESSAGE),
    })
  }

  return {
    transactionNotice,
    clearTransactionNotice,
    setSuccessNotice,
    setErrorNotice,
  }
}
