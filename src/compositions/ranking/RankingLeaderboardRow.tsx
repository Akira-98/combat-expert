import { getWalletAvatarUrl, shortenAddress } from '../../helpers/walletUi'
import { formatPercentRatio, formatSignedUsdt } from '../../helpers/formatters'
import type { RankingEntry } from '../../hooks/useRankings'
import { useI18n } from '../../i18n'

type RankingLeaderboardRowProps = {
  entry: RankingEntry
  rank: number
  isViewer: boolean
}

export function RankingLeaderboardRow({ entry, rank, isViewer }: RankingLeaderboardRowProps) {
  const { t } = useI18n()
  const rowClassName = isViewer ? 'ui-rank-row-viewer' : 'ui-rank-row'
  const displayName = entry.nickname || shortenAddress(entry.address, 6, 4)

  return (
    <article className={`card-surface-soft card-shell-xl ui-border grid gap-3 border p-3 md:gap-5 md:p-5 ${rowClassName}`}>
      <div className="flex min-w-0 items-center justify-between gap-3 md:gap-4">
        <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
          <img alt="" className="h-9 w-9 shrink-0 rounded-lg border object-cover md:h-12 md:w-12 md:rounded-xl" src={getWalletAvatarUrl(entry.address)} />
          <div className="min-w-0">
            <p className="ui-text-strong m-0 truncate text-base font-semibold md:text-xl">{displayName}</p>
            <p className="ui-text-muted mt-1 mb-0 truncate text-xs">{shortenAddress(entry.address, 6, 4)}</p>
          </div>
        </div>

        <RankBadge rank={rank} />
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(11rem,0.8fr)] md:gap-5">
        <div className="grid gap-1.5 md:gap-2">
          <p className="ui-text-muted m-0 text-xs font-semibold md:text-sm">{t('ranking.pnl')}</p>
          <div className="flex min-w-0 flex-wrap items-end gap-x-2.5 gap-y-1.5 md:gap-x-4 md:gap-y-2">
            <p className="ui-rank-score m-0 text-2xl font-semibold leading-none md:text-4xl">
              {formatSignedUsdt(entry.netPnl)}
            </p>
            <span className="ui-state-success rounded-md border px-2 py-0.5 text-sm font-semibold md:px-3 md:py-1 md:text-base">
              {formatPercentRatio(entry.roi)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 md:text-right">
          <EntryMetric label="Won" value={String(entry.winCount)} />
          <EntryMetric label="Lose" value={String(entry.loseCount)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <EntryMetric label={t('ranking.hitRate')} value={formatPercentRatio(entry.winRate)} />
        <EntryMetric label={t('ranking.events')} value={String(entry.eventCount)} />
        <EntryMetric label={t('ranking.totalWagered')} value={`${entry.totalWagered.toFixed(2)} USDT`} />
      </div>
    </article>
  )
}

function EntryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="ui-text-muted m-0 truncate text-xs font-semibold md:text-sm">{label}</p>
      <p className="ui-text-strong mt-0.5 mb-0 truncate text-base font-semibold md:mt-1 md:text-xl">{value}</p>
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const medal = getRankMedal(rank)

  if (medal) {
    return (
      <div aria-label={`Rank ${rank}`} className="flex h-11 w-11 shrink-0 items-center justify-center text-4xl leading-none md:h-16 md:w-16 md:text-5xl" title={`Rank ${rank}`}>
        {medal}
      </div>
    )
  }

  return (
    <div
      aria-label={`Rank ${rank}`}
      className="ui-rank-badge-viewer flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base font-black md:h-14 md:w-14 md:rounded-xl md:text-lg"
      title={`Rank ${rank}`}
    >
      {rank}
    </div>
  )
}

function getRankMedal(rank: number) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return undefined
}
