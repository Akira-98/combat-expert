import type { MobileView } from '../hooks/useAppNavigation'

type AppBottomNavProps = {
  mobileView: MobileView
  isMobileBetslipOpen: boolean
  selectionCount: number
  onOpenExplore: () => void
  onOpenBetslip: () => void
  onOpenChat: () => void
  onOpenBets: () => void
}

export function AppBottomNav({
  mobileView,
  isMobileBetslipOpen,
  selectionCount,
  onOpenExplore,
  onOpenBetslip,
  onOpenChat,
  onOpenBets,
}: AppBottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 bg-[color:color-mix(in_oklab,var(--app-surface)_88%,transparent)] px-2.5 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-1 backdrop-blur xl:hidden">
      <div className="mx-auto grid w-full max-w-[560px] grid-cols-4 gap-1.5">
        <button
          className={`relative px-2 py-2 text-xs font-semibold transition ${
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
          className={`relative px-2 py-2 text-xs font-semibold transition ${
            isMobileBetslipOpen ? 'text-orange-200' : 'text-slate-400 hover:text-slate-200'
          }`}
          onClick={onOpenBetslip}
          type="button"
        >
          <span
            aria-hidden
            className={`absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-orange-400 transition ${
              isMobileBetslipOpen ? 'opacity-100' : 'opacity-0'
            }`}
          />
          베팅슬립
          <span className="ml-1 rounded-full bg-orange-500/20 px-1.5 py-0.5 text-[10px] text-orange-200">
            {selectionCount}
          </span>
        </button>
        <button
          className={`relative px-2 py-2 text-xs font-semibold transition ${
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
          className={`relative px-2 py-2 text-xs font-semibold transition ${
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
      </div>
    </nav>
  )
}
