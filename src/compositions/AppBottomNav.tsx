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
    <nav className="fixed inset-x-0 bottom-0 z-40 px-2.5 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 xl:hidden">
      <div className="mx-auto grid w-full max-w-[560px] grid-cols-[1fr_1fr_auto_1fr_1fr] items-end gap-1.5 rounded-[26px] border bg-[color:color-mix(in_oklab,var(--app-surface)_92%,transparent)] px-2 py-2 backdrop-blur">
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
          className={`relative -mt-6 inline-flex h-14 w-14 items-center justify-center self-center rounded-full border text-sm font-semibold shadow-lg shadow-slate-950/35 transition ${
            isMobileBetslipOpen
              ? 'ui-btn-primary text-white'
              : 'bg-[color:color-mix(in_oklab,var(--app-accent)_88%,black)] text-white hover:brightness-110'
          }`}
          onClick={onOpenBetslip}
          type="button"
        >
          <span className="absolute -right-1 -top-1 rounded-full bg-orange-300 px-1.5 py-0.5 text-[10px] font-bold text-slate-950">
            {selectionCount}
          </span>
          베팅
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
    </nav>
  )
}
