import type { MobileView } from '../hooks/useAppNavigation'

type AppBottomNavProps = {
  mobileView: MobileView
  isMobileBetslipOpen: boolean
  isMobileMenuOpen: boolean
  selectionCount: number
  onOpenExplore: () => void
  onOpenBetslip: () => void
  onOpenChat: () => void
  onOpenBets: () => void
  onOpenMenu: () => void
}

export function AppBottomNav({
  mobileView,
  isMobileBetslipOpen,
  isMobileMenuOpen,
  selectionCount,
  onOpenExplore,
  onOpenBetslip,
  onOpenChat,
  onOpenBets,
  onOpenMenu,
}: AppBottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 xl:hidden">
      <div className="relative mx-auto w-full max-w-[560px]">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[calc(100%+env(safe-area-inset-bottom))] border-t border-slate-800/80 bg-[color:color-mix(in_oklab,var(--app-surface)_96%,black)] shadow-[0_-10px_24px_rgba(2,6,23,0.42)] backdrop-blur" />
        <div className="relative grid w-full grid-cols-[1fr_1fr_auto_1fr_1fr] items-end gap-1 px-2 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2">
          <button
            className={`relative rounded-2xl px-2 py-2 text-xs font-semibold transition ${
              mobileView === 'explore' ? 'text-orange-200' : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={onOpenExplore}
            type="button"
          >
            <span
              aria-hidden
              className={`absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-orange-400 transition ${
                mobileView === 'explore' ? 'opacity-100' : 'opacity-0'
              }`}
            />
            탐색
          </button>
          <button
            className={`relative rounded-2xl px-2 py-2 text-xs font-semibold transition ${
              mobileView === 'chat' ? 'text-orange-200' : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={onOpenChat}
            type="button"
          >
            <span
              aria-hidden
              className={`absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-orange-400 transition ${
                mobileView === 'chat' ? 'opacity-100' : 'opacity-0'
              }`}
            />
            채팅
          </button>
          <button
            aria-label="베팅슬립 열기"
            className={`relative -mt-3 inline-flex h-12 w-[5.75rem] flex-col items-center justify-center self-center rounded-[20px] border px-3 text-[11px] font-semibold leading-none shadow-lg shadow-slate-950/30 transition ${
              isMobileBetslipOpen
                ? 'ui-btn-primary text-white'
                : 'bg-[color:color-mix(in_oklab,var(--app-accent)_88%,black)] text-white hover:brightness-110'
            }`}
            onClick={onOpenBetslip}
            type="button"
          >
            <span className="absolute -right-1.5 -top-1.5 rounded-full bg-orange-300 px-1.5 py-0.5 text-[10px] font-bold leading-none text-slate-950">
              {selectionCount}
            </span>
            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
              <path d="M4 8.5a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 15.5z" stroke="currentColor" strokeWidth="1.8" />
              <path d="M9 12h6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              <circle cx="8" cy="12" fill="currentColor" r="1" />
              <circle cx="16" cy="12" fill="currentColor" r="1" />
            </svg>
            <span className="mt-1">베팅</span>
          </button>
          <button
            className={`relative rounded-2xl px-2 py-2 text-xs font-semibold transition ${
              mobileView === 'bets' ? 'text-orange-200' : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={onOpenBets}
            type="button"
          >
            <span
              aria-hidden
              className={`absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-orange-400 transition ${
                mobileView === 'bets' ? 'opacity-100' : 'opacity-0'
              }`}
            />
            내 베팅
          </button>
          <button
            className={`relative rounded-2xl px-2 py-2 text-xs font-semibold transition ${
              isMobileMenuOpen ? 'text-orange-200' : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={onOpenMenu}
            type="button"
          >
            <span
              aria-hidden
              className={`absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-orange-400 transition ${
                isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
              }`}
            />
            메뉴
          </button>
        </div>
      </div>
    </nav>
  )
}
