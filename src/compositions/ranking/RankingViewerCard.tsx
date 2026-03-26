import type { RankingViewer } from '../../hooks/useRankings'
import { shortenAddress } from '../../helpers/walletUi'
import { useI18n } from '../../i18n'

type RankingViewerCardProps = {
  viewer: RankingViewer | null
  isConnected: boolean
}

export function RankingViewerCard({ viewer, isConnected }: RankingViewerCardProps) {
  const { t } = useI18n()
  if (!isConnected) return null

  return (
    <section className="card-surface-soft card-shell-xl relative overflow-hidden border-orange-400/18 bg-[linear-gradient(135deg,rgba(251,146,60,0.12)_0%,rgba(15,23,42,0.96)_34%,rgba(15,23,42,0.98)_100%)] shadow-[0_0_0_1px_rgba(251,146,60,0.08),0_18px_40px_-28px_rgba(251,146,60,0.34)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.18),transparent_58%)]" />
      <div className="relative px-4 py-4 md:px-5">
        <p className="ui-text-muted m-0 text-[11px] font-medium uppercase tracking-[0.18em]">My Standing</p>
        {viewer ? (
          <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)] md:gap-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="inline-flex items-center rounded-full border border-orange-300/30 bg-orange-400/10 px-3 py-1 text-sm font-black text-orange-100">
                    #{viewer.rank}
                  </div>
                  <p className="ui-text-strong mt-3 mb-0 truncate text-xl font-semibold md:text-2xl">
                    {viewer.nickname || shortenAddress(viewer.address, 6, 4)}
                  </p>
                  <p className="ui-text-muted mt-1 mb-0 truncate text-xs md:text-sm">{shortenAddress(viewer.address, 7, 5)}</p>
                </div>
                <div className="text-right">
                  <p className="ui-text-muted m-0 text-[10px] font-medium uppercase tracking-[0.18em]">Score</p>
                  <p className="ui-text-strong mt-1 mb-0 text-3xl font-semibold leading-none">{viewer.totalScore.toFixed(1)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-x-3 gap-y-3 border-t border-white/8 pt-4 md:gap-x-5 md:border-t-0 md:border-l md:pt-0 md:pl-5">
              <StatItem
                label={t('ranking.record')}
                value={t('ranking.winsLosses', { wins: viewer.winCount, losses: viewer.loseCount })}
                secondaryValue={viewer.voidCount > 0 ? t('ranking.void', { count: viewer.voidCount }) : null}
              />
              <StatItem label={t('ranking.hitRate')} value={formatHitRate(viewer.winCount, viewer.loseCount)} />
              <StatItem label={t('ranking.underdog')} value={String(viewer.underdogHitCount)} />
              <StatItem label={t('ranking.events')} value={String(viewer.eventCount)} />
            </div>
          </div>
        ) : (
          <div className="mt-4 border-t border-white/8 pt-4">
            <p className="ui-text-strong m-0 text-sm font-semibold">{t('ranking.noViewerData')}</p>
            <p className="ui-text-muted mt-1 mb-0 text-sm">{t('ranking.noViewerDataDesc')}</p>
          </div>
        )}
      </div>
    </section>
  )
}

function StatItem({
  label,
  value,
  secondaryValue,
}: {
  label: string
  value: string
  secondaryValue?: string | null
}) {
  return (
    <div className="min-w-0">
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
