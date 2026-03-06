import { MyBets } from './MyBets'
import { WalletTransferPanel } from './WalletTransferPanel'
import type { useWalletConnection } from '../hooks/useWalletConnection'
import type { useBetting } from '../hooks/useBetting'
import type { useUsdtTransfer } from '../hooks/useUsdtTransfer'

type BetsAndTransferPanelProps = {
  wallet: ReturnType<typeof useWalletConnection>
  betting: ReturnType<typeof useBetting>
  usdtTransfer: ReturnType<typeof useUsdtTransfer>
}

export function BetsAndTransferPanel({ wallet, betting, usdtTransfer }: BetsAndTransferPanelProps) {
  return (
    <div className="grid gap-3">
      <MyBets
        address={wallet.address}
        bets={betting.bets}
        redeemPending={betting.redeemPending}
        redeemingBetTokenId={betting.redeemingBetTokenId}
        onRedeemBet={betting.redeemBet}
      />
      <WalletTransferPanel
        isConnected={wallet.isConnected}
        chainId={wallet.chainId}
        tokenAddress={usdtTransfer.tokenAddress}
        balance={usdtTransfer.balance}
        recipient={usdtTransfer.recipient}
        amountInput={usdtTransfer.amountInput}
        isSending={usdtTransfer.isSending}
        validationMessage={usdtTransfer.validationMessage}
        canSend={usdtTransfer.canSend}
        transactionNotice={usdtTransfer.transactionNotice}
        onRecipientChange={usdtTransfer.setRecipient}
        onAmountChange={usdtTransfer.setAmountInput}
        onSetMaxAmount={usdtTransfer.setMaxAmount}
        onSend={usdtTransfer.sendUsdt}
      />
    </div>
  )
}
