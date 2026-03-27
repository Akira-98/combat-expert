import { useRef, useState, type TouchEvent } from 'react'
import { useI18n } from '../i18n'
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
  const { t } = useI18n()
  const DRAG_CLOSE_THRESHOLD_PX = 96
  const touchStartYRef = useRef<number | null>(null)
  const [dragOffsetY, setDragOffsetY] = useState(0)
  const isDragging = dragOffsetY > 0

  const resetDrag = () => {
    touchStartYRef.current = null
    setDragOffsetY(0)
  }

  const handleSheetTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? null
  }

  const handleSheetTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartYRef.current == null) return

    const currentY = event.touches[0]?.clientY
    if (currentY == null) return

    const nextOffset = Math.max(0, currentY - touchStartYRef.current)
    setDragOffsetY(nextOffset)

    if (nextOffset > 0) {
      event.preventDefault()
    }
  }

  const handleSheetTouchEnd = () => {
    if (dragOffsetY >= DRAG_CLOSE_THRESHOLD_PX) {
      resetDrag()
      onClose()
      return
    }

    resetDrag()
  }

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
          <span className="ui-text-strong text-sm font-semibold">{t('betslip.title')}</span>
          <span className="ui-btn-primary rounded-full border px-2.5 py-1 text-xs font-semibold">{selectionCount}</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label={t('common.close')}
            className="ui-overlay-scrim absolute inset-0"
            onClick={onClose}
            type="button"
          />
          <div
            className={`ui-surface-soft absolute inset-x-0 bottom-0 flex max-h-[min(92dvh,760px)] flex-col rounded-t-2xl border p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-2xl ${
              isDragging ? '' : 'transition-transform duration-200 ease-out'
            }`}
            onTouchEnd={handleSheetTouchEnd}
            onTouchMove={handleSheetTouchMove}
            onTouchStart={handleSheetTouchStart}
            style={{ transform: `translateY(${dragOffsetY}px)` }}
          >
            <div className="flex justify-center pb-3">
              <div className="ui-sheet-handle h-1.5 w-12 rounded-full" />
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
