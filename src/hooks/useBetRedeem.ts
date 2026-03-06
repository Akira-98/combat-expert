import { useState } from 'react'
import { type Bet, useRedeemBet } from '@azuro-org/sdk'

type UseBetRedeemParams = {
  onSuccess: (receiptHash?: `0x${string}`) => void
  onError: (error: unknown) => void
  onBeforeSubmit?: () => void
}

export function useBetRedeem({ onSuccess, onError, onBeforeSubmit }: UseBetRedeemParams) {
  const [redeemingBetTokenId, setRedeemingBetTokenId] = useState<string | undefined>()
  const redeemBetTx = useRedeemBet()

  const redeemBet = async (bet: Bet) => {
    if (!bet.isRedeemable || bet.isRedeemed) return

    onBeforeSubmit?.()
    setRedeemingBetTokenId(bet.tokenId)

    try {
      const receipt = await redeemBetTx.submit({
        bets: [
          {
            tokenId: bet.tokenId,
            coreAddress: bet.coreAddress,
            lpAddress: bet.lpAddress,
            freebetId: bet.freebetId,
            paymaster: bet.paymaster,
          },
        ],
      })

      onSuccess(receipt?.transactionHash)
    } catch (error) {
      onError(error)
    } finally {
      setRedeemingBetTokenId(undefined)
    }
  }

  return {
    redeemingBetTokenId,
    redeemPending: redeemBetTx.isPending || redeemBetTx.isProcessing,
    redeemBet,
  }
}
