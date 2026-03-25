import { createPortal } from 'react-dom'
import type { useUsdtTransfer } from '../../hooks/useUsdtTransfer'
import { WalletTransferPanel } from '../WalletTransferPanel'

type TransferModalProps = {
  isOpen: boolean
  isConnected: boolean
  chainId?: number
  usdtTransfer: ReturnType<typeof useUsdtTransfer>
  onClose: () => void
}

export function TransferModal({ isOpen, isConnected, chainId, usdtTransfer, onClose }: TransferModalProps) {
  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div aria-modal="true" className="fixed inset-0 z-[80] flex items-center justify-center px-2 md:px-4" role="dialog">
      <button aria-label="입출금 모달 닫기" className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} type="button" />
      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-2 flex justify-end">
          <button className="ui-btn-secondary rounded-md border px-3 py-1.5 text-sm font-semibold" onClick={onClose} type="button">
            닫기
          </button>
        </div>
        <WalletTransferPanel
          isConnected={isConnected}
          chainId={chainId}
          balance={usdtTransfer.balance}
          recipient={usdtTransfer.recipient}
          amountInput={usdtTransfer.amountInput}
          isSending={usdtTransfer.isSending}
          validationMessage={usdtTransfer.validationMessage}
          transactionNotice={usdtTransfer.transactionNotice}
          onRecipientChange={usdtTransfer.setRecipient}
          onAmountChange={usdtTransfer.setAmountInput}
          onSetMaxAmount={usdtTransfer.setMaxAmount}
          onSend={usdtTransfer.sendUsdt}
        />
      </div>
    </div>,
    document.body,
  )
}
