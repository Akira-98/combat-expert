import { MyBets } from './MyBets'
import type { useWalletConnection } from '../hooks/useWalletConnection'
import type { useBetting } from '../hooks/useBetting'

type BetsAndTransferPanelProps = {
  wallet: ReturnType<typeof useWalletConnection>
  betting: ReturnType<typeof useBetting>
  isEmbedded?: boolean
}

export function BetsAndTransferPanel({ wallet, betting, isEmbedded = false }: BetsAndTransferPanelProps) {
  return (
    <div className="grid gap-3">
      <MyBets
        address={wallet.address}
        bets={betting.bets}
        betSettlementSyncStateByTokenId={betting.betSettlementSyncStateByTokenId}
        redeemPending={betting.redeemPending}
        redeemingBetTokenId={betting.redeemingBetTokenId}
        onRedeemBet={betting.redeemBet}
        isEmbedded={isEmbedded}
      />
    </div>
  )
}
