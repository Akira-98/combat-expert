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
        <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] px-4 py-4">
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
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <StatChip label="점수" value={viewer.totalScore.toFixed(1)} />
              <StatChip label="언더독" value={String(viewer.underdogHitCount)} />
              <StatChip label="경기수" value={String(viewer.eventCount)} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) return null

  return (
    <div className="border-b border-white/8 px-4 py-4 md:px-6">
      <div className="rounded-[26px] border border-dashed border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.015)_100%)] px-4 py-4">
        <p className="ui-text-strong m-0 text-sm font-semibold">내 랭킹 데이터가 아직 없습니다.</p>
        <p className="ui-text-muted mt-1 mb-0 text-sm">정산된 예측이 누적되면 여기서 내 순위와 점수를 바로 볼 수 있습니다.</p>
      </div>
    </div>
  )
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/10 px-3 py-2">
      <p className="ui-text-muted m-0 text-[10px] font-medium uppercase tracking-[0.18em]">{label}</p>
      <p className="ui-text-strong mt-1 mb-0 text-base font-bold">{value}</p>
    </div>
  )
}
