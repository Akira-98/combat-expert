import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useAccount as useAppAccount, useAAWalletClient as useAppAAWalletClient } from './azuroSocialAaConnector'
import { withPrivySendTransactionUi, withPrivySignMessageUi } from './helpers/privyUi'
import { aaWalletClientContext, accountContext, type AAWalletClientContextValue } from './azuroSdkSocialAaConnectorContext'

type SmartWalletClient = NonNullable<AAWalletClientContextValue>
type SmartWalletSendTransaction = SmartWalletClient['sendTransaction']
type SmartWalletSendTransactionArgs = Parameters<SmartWalletSendTransaction>
type SmartWalletSignTypedData = SmartWalletClient['signTypedData']
type SmartWalletSignTypedDataArgs = Parameters<SmartWalletSignTypedData>

const normalizeBigInts = (value: unknown): unknown => {
  if (typeof value === 'bigint') return value.toString()
  if (Array.isArray(value)) return value.map((item) => normalizeBigInts(item))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeBigInts(item)]))
  }
  return value
}

export function AzuroSdkSocialAaConnectorProvider({ children }: { children: ReactNode }) {
  const account = useAppAccount()
  const aaWalletClient = useAppAAWalletClient()

  const accountValue = useMemo(() => account, [account])
  const aaWalletClientValue = useMemo(() => {
    if (!aaWalletClient) return null

    const baseClient = aaWalletClient as SmartWalletClient

    return {
      ...baseClient,
      sendTransaction: async (...args: SmartWalletSendTransactionArgs) => {
        const [txInput, options] = args
        return baseClient.sendTransaction(
          normalizeBigInts(txInput) as SmartWalletSendTransactionArgs[0],
          withPrivySendTransactionUi(options) as SmartWalletSendTransactionArgs[1],
        )
      },
      signTypedData: async (...args: SmartWalletSignTypedDataArgs) => {
        const [typedDataInput, options] = args
        const input = (typedDataInput ?? {}) as Record<string, unknown>
        const { account: unusedAccount, ...rest } = input
        void unusedAccount

        return baseClient.signTypedData(
          normalizeBigInts(rest) as SmartWalletSignTypedDataArgs[0],
          withPrivySignMessageUi(options) as SmartWalletSignTypedDataArgs[1],
        )
      },
    } as SmartWalletClient
  }, [aaWalletClient])

  return (
    <accountContext.Provider value={accountValue}>
      <aaWalletClientContext.Provider value={aaWalletClientValue}>{children}</aaWalletClientContext.Provider>
    </accountContext.Provider>
  )
}
