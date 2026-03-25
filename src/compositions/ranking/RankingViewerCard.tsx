import type { RankingViewer } from '../../hooks/useRankings'
import { shortenAddress } from '../../helpers/walletUi'

type RankingViewerCardProps = {
  viewer: RankingViewer | null
  isConnected: boolean
}

export function RankingViewerCard({ viewer, isConnected }: RankingViewerCardProps) {
  if (!isConnected) return null

  return (
    <div className="border-b border-white/8 px-4 py-4 md:px-6">
      <div className="card-shell-xl relative overflow-hidden border border-orange-400/18 bg-[linear-gradient(135deg,rgba(251,146,60,0.14)_0%,rgba(15,23,42,0.96)_34%,rgba(15,23,42,0.98)_100%)] px-4 py-4 shadow-[0_0_0_1px_rgba(251,146,60,0.08),0_18px_40px_-28px_rgba(251,146,60,0.34)] md:px-5">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.22),transparent_58%)]" />
        <div className="relative">
          <p className="ui-text-muted m-0 text-[11px] font-medium uppercase tracking-[0.18em]">My Standing</p>
          {viewer ? (
            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="inline-flex items-center rounded-full border border-orange-300/35 bg-orange-400/12 px-3 py-1 text-sm font-black text-orange-100">
                      #{viewer.rank}
                    </div>
                    <p className="ui-text-strong mt-3 mb-0 truncate text-xl font-semibold md:text-2xl">
                      {viewer.nickname || shortenAddress(viewer.address, 6, 4)}
                    </p>
                    <p className="ui-text-muted mt-1 mb-0 truncate text-xs md:text-sm">{shortenAddress(viewer.address, 7, 5)}</p>
                  </div>
                  <div className="card-shell-lg min-w-[120px] border border-white/8 bg-white/[0.045] px-3 py-3 text-right backdrop-blur-sm">
                    <p className="ui-text-muted m-0 text-[10px] font-medium uppercase tracking-[0.18em]">Score</p>
                    <p className="ui-text-strong mt-1 mb-0 text-3xl font-semibold leading-none">{viewer.totalScore.toFixed(1)}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3 md:border-l md:border-white/8 md:pl-4">
                <StatRow
                  label="전적"
                  value={`${viewer.winCount}승 ${viewer.loseCount}패`}
                  secondaryValue={viewer.voidCount > 0 ? `무효 ${viewer.voidCount}` : null}
                />
                <StatRow label="적중률" value={formatHitRate(viewer.winCount, viewer.loseCount)} />
                <StatRow label="언더독" value={String(viewer.underdogHitCount)} />
                <StatRow label="경기수" value={String(viewer.eventCount)} />
              </div>
            </div>
          ) : (
            <div className="mt-4 card-shell-lg border border-dashed border-white/10 bg-black/16 px-4 py-4 backdrop-blur-sm">
              <p className="ui-text-strong m-0 text-sm font-semibold">내 랭킹 데이터가 아직 없습니다.</p>
              <p className="ui-text-muted mt-1 mb-0 text-sm">정산된 예측이 누적되면 여기서 내 순위와 점수를 바로 볼 수 있습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatRow({
  label,
  value,
  secondaryValue,
}: {
  label: string
  value: string
  secondaryValue?: string | null
}) {
  return (
    <div className="card-shell-lg min-w-0 border border-white/8 bg-black/18 px-3 py-3 backdrop-blur-sm">
      <p className="ui-text-muted m-0 text-[9px] font-medium uppercase tracking-[0.14em] md:text-[10px] md:tracking-[0.18em]">{label}</p>
      <p className="ui-text-strong mt-2 mb-0 truncate text-sm font-bold md:text-base">{value}</p>
      {secondaryValue ? <p className="ui-text-muted mt-1 mb-0 truncate text-[10px] md:text-[11px]">{secondaryValue}</p> : null}
    </div>
  )
}

function formatHitRate(winCount: number, loseCount: number) {
  const total = winCount + loseCount

  if (total <= 0) return '-'

  return `${((winCount / total) * 100).toFixed(0)}%`
}
