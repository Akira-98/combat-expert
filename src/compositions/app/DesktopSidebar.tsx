import type { useBetting } from '../../hooks/useBetting'
import type { useUsdtTransfer } from '../../hooks/useUsdtTransfer'
import type { useWalletConnection } from '../../hooks/useWalletConnection'
import type { BetslipPanelProps } from '../BetslipPanel'
import { BetslipPanel } from '../BetslipPanel'
import { BetsAndTransferPanel } from '../BetsAndTransferPanel'

type DesktopSidebarProps = {
  desktopSidePanelTab: 'myBets' | 'betslip'
  selectionCount: number
  wallet: ReturnType<typeof useWalletConnection>
  betting: ReturnType<typeof useBetting>
  usdtTransfer: ReturnType<typeof useUsdtTransfer>
  betslipPanelProps: BetslipPanelProps
  onChangeTab: (tab: 'myBets' | 'betslip') => void
}

export function DesktopSidebar({
  desktopSidePanelTab,
  selectionCount,
  wallet,
  betting,
  usdtTransfer,
  betslipPanelProps,
  onChangeTab,
}: DesktopSidebarProps) {
  const tabButtonBaseClass = 'btn-shell-lg px-3 py-2 text-sm font-semibold transition'

  return (
    <aside className="hidden xl:sticky xl:top-4 xl:block xl:max-h-[calc(100dvh-2rem)] xl:overflow-y-auto">
      <div className="grid gap-3">
        <div className="card-surface card-shell-lg p-2">
          <div className="grid grid-cols-2 gap-1">
            <button
              className={`${tabButtonBaseClass} ${desktopSidePanelTab === 'myBets' ? 'ui-btn-primary' : 'ui-btn-ghost ui-text-body'}`}
              onClick={() => onChangeTab('myBets')}
              type="button"
            >
              내 베팅
            </button>
            <button
              className={`${tabButtonBaseClass} ${desktopSidePanelTab === 'betslip' ? 'ui-btn-primary' : 'ui-btn-ghost ui-text-body'}`}
              onClick={() => onChangeTab('betslip')}
              type="button"
            >
              베팅슬립 {selectionCount > 0 ? `(${selectionCount})` : ''}
            </button>
          </div>
        </div>

        {desktopSidePanelTab === 'myBets' ? (
          <BetsAndTransferPanel wallet={wallet} betting={betting} usdtTransfer={usdtTransfer} />
        ) : (
          <BetslipPanel {...betslipPanelProps} />
        )}
      </div>
    </aside>
  )
}
