import { createPortal } from 'react-dom'
import { useI18n } from '../../i18n'

type MobileMenuSheetProps = {
  isOpen: boolean
  onClose: () => void
  onOpenGuide: () => void
  onOpenLeaderboard: () => void
}

export function MobileMenuSheet({
  isOpen,
  onClose,
  onOpenGuide,
  onOpenLeaderboard,
}: MobileMenuSheetProps) {
  const { t } = useI18n()
  if (!isOpen || typeof document === 'undefined') return null

  const menuButtonClass =
    'ui-text-strong border-0 bg-transparent px-0 py-2 text-left text-sm font-black uppercase tracking-[0.08em] transition hover:text-[color:var(--app-accent)]'

  return createPortal(
    <div aria-modal="true" className="fixed inset-0 z-[72] xl:hidden" role="dialog">
      <button
        aria-label={t('menu.close')}
        className="ui-overlay-scrim absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <aside className="ui-surface-soft absolute inset-y-0 right-0 flex w-[min(82vw,320px)] flex-col border-l p-4 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="ui-text-strong m-0 text-base font-semibold">{t('common.menu')}</p>
          </div>
          <button className="ui-btn-secondary btn-shell inline-flex h-8 w-8 items-center justify-center" onClick={onClose} type="button">
            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.8" />
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
        </div>
        <div className="mt-5 grid gap-2">
          <button className={menuButtonClass} type="button">
            {t('nav.news')}
          </button>
          <button className={menuButtonClass} type="button">
            {t('nav.playerRankings')}
          </button>
          <button className={menuButtonClass} type="button">
            {t('nav.forum')}
          </button>
          <button className={menuButtonClass} onClick={onOpenLeaderboard} type="button">
            {t('nav.leaderboard')}
          </button>
          <button className={menuButtonClass} onClick={onOpenGuide} type="button">
            {t('nav.guide')}
          </button>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
