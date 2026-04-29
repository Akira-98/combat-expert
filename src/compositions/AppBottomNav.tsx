import type { MobileView } from '../hooks/useAppNavigation'
import { useI18n } from '../i18n'

type AppBottomNavProps = {
  mobileView: MobileView
  isExploreActive: boolean
  isRankingActive: boolean
  isMobileBetslipOpen: boolean
  isMobileMenuOpen: boolean
  selectionCount: number
  onOpenExplore: () => void
  onOpenBetslip: () => void
  onOpenRankings: () => void
  onOpenBets: () => void
  onOpenMenu: () => void
}

export function AppBottomNav({
  mobileView,
  isExploreActive,
  isRankingActive,
  isMobileBetslipOpen,
  isMobileMenuOpen,
  selectionCount,
  onOpenExplore,
  onOpenBetslip,
  onOpenRankings,
  onOpenBets,
  onOpenMenu,
}: AppBottomNavProps) {
  const { t } = useI18n()
  const navItemClass = 'relative inline-flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-semibold leading-none transition'
  const navItemActiveClass = 'ui-bottom-nav-item-active'
  const navItemIdleClass = 'ui-bottom-nav-item'

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 xl:hidden">
      <div className="relative mx-auto w-full max-w-[560px]">
        <div className="ui-bottom-nav-shell pointer-events-none absolute inset-x-0 bottom-0 h-[calc(100%+env(safe-area-inset-bottom))] border-t backdrop-blur" />
        <div className="relative grid w-full grid-cols-[1fr_1fr_auto_1fr_1fr] items-end gap-1 px-2 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2">
          <button
            className={`${navItemClass} ${
              isExploreActive ? navItemActiveClass : navItemIdleClass
            }`}
            onClick={onOpenExplore}
            type="button"
          >
            <span
              aria-hidden
              className={`ui-bottom-nav-indicator absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full transition ${
                isExploreActive ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
              <path d="M12 4.75 18.25 7.3v4.02c0 3.77-2.33 7.21-5.9 8.72l-.35.15-.35-.15c-3.57-1.51-5.9-4.95-5.9-8.72V7.3z" stroke="currentColor" strokeWidth="1.8" />
              <path d="m9.75 12 1.5 1.5 3-3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
            <span className="mt-1">{t('bottomNav.explore')}</span>
          </button>
          <button
            className={`${navItemClass} ${
              isRankingActive ? navItemActiveClass : navItemIdleClass
            }`}
            onClick={onOpenRankings}
            type="button"
          >
            <span
              aria-hidden
              className={`ui-bottom-nav-indicator absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full transition ${
                isRankingActive ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
              <path d="M8 21h8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              <path d="M12 16v5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              <path d="M7 4h10v3a5 5 0 0 1-10 0V4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              <path d="M7 6H5a2 2 0 0 0 2 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              <path d="M17 6h2a2 2 0 0 1-2 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
            <span className="mt-1">{t('bottomNav.rankings')}</span>
          </button>
          <button
            aria-label={t('bottomNav.openBetslip')}
            className={`relative -mt-3 inline-flex h-12 w-[5.75rem] flex-col items-center justify-center self-center rounded-[20px] border px-3 text-[11px] font-semibold leading-none shadow-lg shadow-slate-950/30 transition ${
              isMobileBetslipOpen
                ? 'ui-btn-primary'
                : 'ui-bottom-nav-primary'
            }`}
            onClick={onOpenBetslip}
            type="button"
          >
            <span className="ui-bottom-nav-badge absolute -right-1.5 -top-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none">
              {selectionCount}
            </span>
            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
              <path d="M4 8.5a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 15.5z" stroke="currentColor" strokeWidth="1.8" />
              <path d="M9 12h6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              <circle cx="8" cy="12" fill="currentColor" r="1" />
              <circle cx="16" cy="12" fill="currentColor" r="1" />
            </svg>
            <span className="mt-1">{t('bottomNav.betslip')}</span>
          </button>
          <button
            className={`${navItemClass} ${
              mobileView === 'bets' ? navItemActiveClass : navItemIdleClass
            }`}
            onClick={onOpenBets}
            type="button"
          >
            <span
              aria-hidden
              className={`ui-bottom-nav-indicator absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full transition ${
                mobileView === 'bets' ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
              <path d="M6.75 7.75h10.5A1.75 1.75 0 0 1 19 9.5v7a1.75 1.75 0 0 1-1.75 1.75H6.75A1.75 1.75 0 0 1 5 16.5v-7a1.75 1.75 0 0 1 1.75-1.75Z" stroke="currentColor" strokeWidth="1.8" />
              <path d="M8.5 11.25h7M8.5 14.25h4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              <circle cx="16.25" cy="11.25" fill="currentColor" r="1" />
            </svg>
            <span className="mt-1">{t('bottomNav.myBets')}</span>
          </button>
          <button
            className={`${navItemClass} ${
              isMobileMenuOpen ? navItemActiveClass : navItemIdleClass
            }`}
            onClick={onOpenMenu}
            type="button"
          >
            <span
              aria-hidden
              className={`ui-bottom-nav-indicator absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full transition ${
                isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
              <path d="M5.5 7.5h13M5.5 12h13M5.5 16.5h13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            </svg>
            <span className="mt-1">{t('bottomNav.menu')}</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
