import { shortenAddress } from '../../helpers/walletUi'
import type { RankingEntry, RankingViewer } from '../../hooks/useRankings'
import { useI18n } from '../../i18n'

type RankingLeaderboardRowProps = {
  entry: RankingEntry
  rank: number
  isViewer: boolean
}

export function RankingLeaderboardRow({ entry, rank, isViewer }: RankingLeaderboardRowProps) {
  const rowClassName = isViewer ? 'ui-rank-row-viewer' : 'ui-rank-row'

  return (
    <div
      className={`grid grid-cols-[72px_minmax(0,1fr)_88px] gap-2 border-b px-4 py-2.5 last:border-b-0 md:grid-cols-[84px_minmax(0,1fr)_112px_280px] ${rowClassName}`}
    >
      <div className="flex items-center">
        <span className="ui-text-muted text-sm font-bold">#{rank}</span>
      </div>
      <div className="flex min-w-0 flex-col justify-center">
        <p className="ui-text-strong m-0 truncate text-sm font-semibold">{entry.nickname || shortenAddress(entry.address, 6, 4)}</p>
        <div className="mt-1.5 md:hidden">
          <EntryMetrics entry={entry} />
        </div>
      </div>
      <div className="flex items-center justify-end">
        <p className="ui-rank-score m-0 text-lg font-black">{entry.totalScore.toFixed(1)}</p>
      </div>
      <div className="hidden items-center justify-end md:flex">
        <EntryMetrics entry={entry} />
      </div>
    </div>
  )
}

function EntryMetrics({ entry }: { entry: RankingEntry | RankingViewer }) {
  const { t } = useI18n()
  return (
    <div className="ui-text-body flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
      <span>{t('ranking.hit', { count: entry.winCount })}</span>
      <span>{t('ranking.miss', { count: entry.loseCount })}</span>
      <span>{t('ranking.underdogCount', { count: entry.underdogHitCount })}</span>
      <span>{t('ranking.totalCount', { count: entry.eventCount })}</span>
    </div>
  )
}
