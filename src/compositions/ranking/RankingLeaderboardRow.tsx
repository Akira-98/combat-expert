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
      ? 'bg-orange-500/8'
      : ''
  const badgeClassName = topRankStyle
    ? topRankStyle.badge
    : isViewer
      ? 'bg-orange-300 text-slate-950'
      : 'bg-white/6 text-slate-200'

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
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300">
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
      row: 'bg-amber-300/8',
      badge: 'bg-amber-200 text-slate-950',
    }
  }

  if (rank === 2) {
    return {
      row: 'bg-slate-200/8',
      badge: 'bg-slate-200 text-slate-950',
    }
  }

  if (rank === 3) {
    return {
      row: 'bg-orange-300/8',
      badge: 'bg-orange-200 text-slate-950',
    }
  }

  return null
}
