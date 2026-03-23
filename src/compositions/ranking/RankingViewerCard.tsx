import type { RankingViewer } from '../../hooks/useRankings'
import { shortenAddress } from '../../helpers/walletUi'

type RankingViewerCardProps = {
  viewer: RankingViewer | null
  isConnected: boolean
}

export function RankingViewerCard({ viewer, isConnected }: RankingViewerCardProps) {
  if (viewer) {
    return (
      <div className="border-b border-white/8 px-4 py-4 md:px-6">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center">
          <div className="min-w-0">
            <p className="ui-text-muted m-0 text-[11px] font-medium uppercase tracking-[0.18em]">My Standing</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
              <div className="inline-flex items-center rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1 text-sm font-black text-orange-200">
                #{viewer.rank}
              </div>
              <p className="ui-text-strong m-0 truncate text-lg font-semibold">{viewer.nickname || shortenAddress(viewer.address, 6, 4)}</p>
            </div>
            <p className="ui-text-muted mt-2 mb-0 text-sm">
              {viewer.winCount}승 {viewer.loseCount}패{viewer.voidCount > 0 ? ` · 무효 ${viewer.voidCount}` : ''}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 border-t border-white/8 pt-3 md:border-t-0 md:border-l md:pl-4 md:pt-0">
            <StatRow label="점수" value={viewer.totalScore.toFixed(1)} />
            <StatRow label="언더독" value={String(viewer.underdogHitCount)} />
            <StatRow label="경기수" value={String(viewer.eventCount)} />
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) return null

  return (
    <div className="border-b border-white/8 px-4 py-4 md:px-6">
      <p className="ui-text-strong m-0 text-sm font-semibold">내 랭킹 데이터가 아직 없습니다.</p>
      <p className="ui-text-muted mt-1 mb-0 text-sm">정산된 예측이 누적되면 여기서 내 순위와 점수를 바로 볼 수 있습니다.</p>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="ui-text-muted m-0 text-[10px] font-medium uppercase tracking-[0.18em]">{label}</p>
      <p className="ui-text-strong mt-1 mb-0 truncate text-base font-bold">{value}</p>
    </div>
  )
}
