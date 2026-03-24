import type { useBetting } from '../../hooks/useBetting'
import type { useWalletConnection } from '../../hooks/useWalletConnection'
import type { BetslipPanelProps } from '../BetslipPanel'
import { BetslipPanel } from '../BetslipPanel'
import { BetsAndTransferPanel } from '../BetsAndTransferPanel'
import { DesktopStickyPanel } from './DesktopSidebarLayout'

const DESKTOP_SIDEBAR_MAX_HEIGHT_CLASS = 'max-h-[calc(100dvh-69px)]'
const DESKTOP_SIDEBAR_SCROLL_AREA_CLASS = 'overflow-y-auto p-3'

type DesktopSidebarProps = {
  desktopSidePanelTab: 'myBets' | 'betslip'
  selectionCount: number
  wallet: ReturnType<typeof useWalletConnection>
  betting: ReturnType<typeof useBetting>
  betslipPanelProps: BetslipPanelProps
  onChangeTab: (tab: 'myBets' | 'betslip') => void
}

export function DesktopSidebar({
  desktopSidePanelTab,
  selectionCount,
  wallet,
  betting,
  betslipPanelProps,
  onChangeTab,
}: DesktopSidebarProps) {
  const tabButtonBaseClass = 'btn-shell-lg px-3 py-2 text-sm font-semibold transition'

  return (
    <DesktopStickyPanel>
      <div className="border-b border-[color:var(--app-border)] p-2">
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

      <div className={`${DESKTOP_SIDEBAR_MAX_HEIGHT_CLASS} ${DESKTOP_SIDEBAR_SCROLL_AREA_CLASS}`}>
        {desktopSidePanelTab === 'myBets' ? (
          <BetsAndTransferPanel wallet={wallet} betting={betting} isEmbedded />
        ) : (
          <BetslipPanel {...betslipPanelProps} isEmbedded />
        )}
      </div>
    </DesktopStickyPanel>
  )
}
