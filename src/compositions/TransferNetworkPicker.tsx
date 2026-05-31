import type { BridgeChain } from '../helpers/bridgeLinks'
import { useI18n } from '../i18n'

export type TransferChain = 'polygon' | BridgeChain

type TransferNetworkPickerProps = {
  chain: TransferChain
  isOpen: boolean
  onChange: (chain: TransferChain) => void
  onToggle: () => void
  className?: string
}

const TRANSFER_CHAINS = ['polygon', 'bnb', 'solana'] as const

export function TransferNetworkPicker({
  chain,
  isOpen,
  onChange,
  onToggle,
  className = '',
}: TransferNetworkPickerProps) {
  const { t } = useI18n()

  return (
    <div className={`${className} grid grid-cols-2 gap-3`}>
      <TransferAssetSelect label={t('walletTransfer.coin')} logoSrc="/tether-logo.svg" value="USDT" />
      <div className="grid gap-1.5">
        <span className="ui-text-muted text-sm font-semibold">{t('walletTransfer.chain')}</span>
        <div className="relative">
          <button
            aria-expanded={isOpen}
            className="ui-surface ui-text-strong flex h-14 w-full items-center justify-between gap-2 rounded-md border px-3 text-left text-lg font-semibold"
            onClick={onToggle}
            type="button"
          >
            <span className="truncate">{getTransferChainLabel(chain)}</span>
            <span aria-hidden="true" className="ui-text-muted text-sm">
              {isOpen ? '^' : 'v'}
            </span>
          </button>
          {isOpen && (
            <div className="ui-surface absolute left-0 right-0 top-[calc(100%+6px)] z-20 grid gap-1 rounded-md border p-1 shadow-xl">
              {TRANSFER_CHAINS.map((nextChain) => (
                <button
                  aria-pressed={chain === nextChain}
                  className={`${chain === nextChain ? 'ui-btn-primary' : 'ui-btn-secondary'} rounded px-3 py-2 text-left text-sm font-semibold transition`}
                  key={nextChain}
                  onClick={() => onChange(nextChain)}
                  type="button"
                >
                  {getTransferChainLabel(nextChain)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getTransferChainLabel(chain: TransferChain) {
  if (chain === 'bnb') return 'BNB'
  if (chain === 'solana') return 'Solana'
  return 'Polygon'
}

function TransferAssetSelect({ label, logoSrc, value }: { label: string; logoSrc: string; value: string }) {
  return (
    <div className="grid gap-1.5">
      <span className="ui-text-muted text-sm font-semibold">{label}</span>
      <div className="ui-surface flex h-14 items-center gap-3 rounded-md border px-3">
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5">
            <img alt="" className="h-6 w-6" src={logoSrc} />
          </span>
          <span className="ui-text-strong truncate text-lg font-semibold">{value}</span>
        </span>
      </div>
    </div>
  )
}
