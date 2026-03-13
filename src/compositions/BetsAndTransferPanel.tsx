import { useState } from 'react'
import { MyBets } from './MyBets'
import { WalletTransferPanel } from './WalletTransferPanel'
import type { useWalletConnection } from '../hooks/useWalletConnection'
import type { useBetting } from '../hooks/useBetting'
import type { useUsdtTransfer } from '../hooks/useUsdtTransfer'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'

type BetsAndTransferPanelProps = {
  wallet: ReturnType<typeof useWalletConnection>
  betting: ReturnType<typeof useBetting>
  usdtTransfer: ReturnType<typeof useUsdtTransfer>
}

export function BetsAndTransferPanel({ wallet, betting, usdtTransfer }: BetsAndTransferPanelProps) {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  useBodyScrollLock(isTransferModalOpen)

  return (
    <div className="grid gap-3">
      <MyBets
        address={wallet.address}
        bets={betting.bets}
        betSettlementSyncStateByTokenId={betting.betSettlementSyncStateByTokenId}
        redeemPending={betting.redeemPending}
        redeemingBetTokenId={betting.redeemingBetTokenId}
        onRedeemBet={betting.redeemBet}
      />
      <section className="ui-surface rounded-none border-x-0 p-2.5 md:rounded-xl md:border md:p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="ui-text-strong m-0 text-base font-semibold">USDT 송금</h2>
          <span className="ui-text-muted text-xs">Polygon</span>
        </div>
        <p className="ui-text-muted mt-1.5 text-xs">송금은 모달에서 입력/확인 후 진행합니다.</p>
        <p className="ui-text-muted mt-2 text-xs">보유 USDT: {usdtTransfer.balance.toFixed(6)}</p>
        <button
          className="ui-btn-primary mt-3 w-full rounded-md border px-3 py-2.5 text-sm font-semibold transition"
          onClick={() => setIsTransferModalOpen(true)}
          type="button"
        >
          USDT 송금 열기
        </button>
      </section>

      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="송금 모달 닫기"
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setIsTransferModalOpen(false)}
            type="button"
          />
          <div className="absolute inset-x-2 top-1/2 mx-auto w-full max-w-lg -translate-y-1/2 md:inset-x-0">
            <div className="mb-2 flex justify-end">
              <button
                className="ui-btn-secondary rounded-md border px-3 py-1.5 text-sm font-semibold"
                onClick={() => setIsTransferModalOpen(false)}
                type="button"
              >
                닫기
              </button>
            </div>
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
        </div>
      )}
    </div>
  )
}
