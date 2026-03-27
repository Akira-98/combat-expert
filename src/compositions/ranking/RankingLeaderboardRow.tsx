import { shortenAddress } from '../../helpers/walletUi'
import type { RankingEntry, RankingViewer } from '../../hooks/useRankings'
import { useI18n } from '../../i18n'

type RankingLeaderboardRowProps = {
  entry: RankingEntry
  rank: number
  isViewer: boolean
}

export function RankingLeaderboardRow({ entry, rank, isViewer }: RankingLeaderboardRowProps) {
  const topRankStyle = getTopRankStyle(rank)
  const rowClassName = topRankStyle
    ? topRankStyle.row
    : isViewer
      ? 'ui-rank-row-viewer'
      : ''
  const badgeClassName = topRankStyle
    ? topRankStyle.badge
    : isViewer
      ? 'ui-rank-badge-viewer'
      : 'ui-rank-badge-mid'

  return (
    <div
      className={`grid grid-cols-[72px_minmax(0,1fr)_88px] gap-2 px-4 py-3 md:grid-cols-[84px_minmax(0,1fr)_112px_280px] ${rowClassName}`}
    >
      <div className="flex items-center">
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badgeClassName}`}>#{rank}</span>
      </div>
      <div className="min-w-0">
        <p className="ui-text-strong m-0 truncate text-sm font-semibold">{entry.nickname || shortenAddress(entry.address, 6, 4)}</p>
        <p className="ui-text-muted mt-1 mb-0 truncate text-xs">{shortenAddress(entry.address, 7, 5)}</p>
        <div className="mt-2 md:hidden">
          <EntryMetrics entry={entry} />
        </div>
      </div>
      <div className="flex items-center justify-end">
        <p className="ui-text-strong m-0 text-lg font-black">{entry.totalScore.toFixed(1)}</p>
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

function getTopRankStyle(rank: number) {
  if (rank === 1) {
    return {
      row: 'ui-rank-row-top',
      badge: 'ui-rank-badge-top',
    }
  }

  if (rank === 2) {
    return {
      row: 'ui-rank-row-mid',
      badge: 'ui-rank-badge-mid',
    }
  }

  if (rank === 3) {
    return {
      row: 'ui-rank-row-viewer',
      badge: 'ui-rank-badge-viewer',
    }
  }

  return null
}
