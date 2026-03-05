import { BetslipPanel, type BetslipPanelProps } from './BetslipPanel'

type MobileBetslipSheetProps = {
  isOpen: boolean
  selectionCount: number
  onOpen: () => void
  onClose: () => void
  panelProps: BetslipPanelProps
  showLauncher?: boolean
}

export function MobileBetslipSheet({
  isOpen,
  selectionCount,
  onOpen,
  onClose,
  panelProps,
  showLauncher = true,
}: MobileBetslipSheetProps) {
  return (
    <div className="xl:hidden">
      {showLauncher && (
        <button
          className={`ui-surface fixed left-1/2 z-40 flex w-[min(92vw,360px)] -translate-x-1/2 items-center justify-between rounded-full border px-4 py-3 shadow-lg shadow-slate-950/30 transition ${
            isOpen ? 'pointer-events-none translate-y-4 opacity-0' : 'bottom-4 opacity-100'
          }`}
          onClick={onOpen}
          type="button"
        >
          <span className="ui-text-strong text-sm font-semibold">베팅슬립</span>
          <span className="ui-btn-primary rounded-full border px-2.5 py-1 text-xs font-semibold">{selectionCount}</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="베팅슬립 닫기"
            className="absolute inset-0 bg-slate-900/40"
            onClick={onClose}
            type="button"
          />
          <div className="ui-surface-soft absolute inset-x-0 bottom-0 flex max-h-[min(92dvh,760px)] flex-col rounded-t-2xl border p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="ui-text-strong m-0 text-base font-semibold">베팅슬립</h2>
              <button
                className="ui-btn-secondary rounded-lg border px-3 py-1.5 text-sm font-semibold"
                onClick={onClose}
                type="button"
              >
                닫기
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <BetslipPanel {...panelProps} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
