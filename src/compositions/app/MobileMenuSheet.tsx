import { createPortal } from 'react-dom'

type MobileMenuSheetProps = {
  isOpen: boolean
  onClose: () => void
  onOpenGuide: () => void
}

export function MobileMenuSheet({
  isOpen,
  onClose,
  onOpenGuide,
}: MobileMenuSheetProps) {
  if (!isOpen || typeof document === 'undefined') return null

  const menuButtonClass = 'ui-btn-secondary btn-shell-lg px-3 py-3 text-left text-sm font-semibold'

  return createPortal(
    <div aria-modal="true" className="fixed inset-0 z-[72] xl:hidden" role="dialog">
      <button
        aria-label="메뉴 닫기"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <aside className="ui-surface-soft absolute inset-y-0 right-0 flex w-[min(82vw,320px)] flex-col border-l p-4 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="ui-text-strong m-0 text-base font-semibold">메뉴</p>
          </div>
          <button className="ui-btn-secondary btn-shell inline-flex h-8 w-8 items-center justify-center" onClick={onClose} type="button">
            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.8" />
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
        </div>
        <div className="mt-5 grid gap-2">
          <button className={menuButtonClass} onClick={onOpenGuide} type="button">
            가이드
          </button>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
