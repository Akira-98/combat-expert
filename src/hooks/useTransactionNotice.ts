import { useState } from 'react'
import type { TransactionNotice } from '../helpers/betslipUi'
import { translate } from '../i18n'

type UseTransactionNoticeParams = {
  mapErrorMessage?: (error: unknown) => string
}

const DEFAULT_ERROR_MESSAGE = translate('notice.defaultError')

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
