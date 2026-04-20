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
    <section className="relative min-w-0">
      <div className="relative">
        <p className="ui-text-muted m-0 text-[11px] font-semibold uppercase tracking-[0.18em]">{t('ranking.myStanding')}</p>
        {viewer ? (
          <div className="mt-3 grid gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex min-w-0 max-w-full flex-1 items-center gap-2">
                  <span className="ui-text-muted shrink-0 text-sm font-black">
                    #{viewer.rank}
                  </span>
                  <p className="ui-text-strong m-0 truncate text-lg font-semibold md:text-xl">
                    {viewer.nickname || shortenAddress(viewer.address, 6, 4)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="ui-text-muted m-0 text-[10px] font-medium uppercase tracking-[0.18em]">Score</p>
                  <p className="ui-text-strong mt-1 mb-0 text-2xl font-semibold leading-none md:text-3xl">{viewer.totalScore.toFixed(1)}</p>
                </div>
              </div>
            </div>

            <div className="ui-divider-faint grid grid-cols-4 gap-x-2 gap-y-2 border-t pt-3">
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
          <div className="ui-divider-faint mt-3 border-t pt-3">
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
      <p className="ui-text-strong mt-1 mb-0 truncate text-sm font-bold md:text-base">{value}</p>
      {secondaryValue ? <p className="ui-text-muted mt-1 mb-0 truncate text-[10px] md:text-[11px]">{secondaryValue}</p> : null}
    </div>
  )
}

function formatHitRate(winCount: number, loseCount: number) {
  const total = winCount + loseCount

  if (total <= 0) return '-'

  return `${((winCount / total) * 100).toFixed(0)}%`
}
