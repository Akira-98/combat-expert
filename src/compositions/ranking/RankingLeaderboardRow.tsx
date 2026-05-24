import { getWalletAvatarUrl, shortenAddress } from '../../helpers/walletUi'
import { formatPercentRatio, formatSignedUsdt } from '../../helpers/formatters'
import type { RankingEntry } from '../../hooks/useRankings'

type RankingLeaderboardRowProps = {
  entry: RankingEntry
  rank: number
  isViewer: boolean
}

export function RankingLeaderboardRow({ entry, rank, isViewer }: RankingLeaderboardRowProps) {
  const rowClassName = isViewer ? 'ui-rank-row-viewer' : 'ui-rank-row'
  const displayName = entry.nickname || shortenAddress(entry.address, 6, 4)

  return (
    <article className={`card-surface-soft card-shell-xl ui-border grid gap-5 border p-4 md:p-5 ${rowClassName}`}>
      <div className="flex min-w-0 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <img alt="" className="h-11 w-11 shrink-0 rounded-xl border object-cover md:h-12 md:w-12" src={getWalletAvatarUrl(entry.address)} />
          <div className="min-w-0">
            <p className="ui-text-strong m-0 truncate text-lg font-semibold md:text-xl">{displayName}</p>
            <p className="ui-text-muted mt-1 mb-0 truncate text-xs">{shortenAddress(entry.address, 6, 4)}</p>
          </div>
        </div>

        <div className="ui-rank-badge-viewer flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black md:h-14 md:w-14">
          {rank}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1.4fr)_minmax(11rem,0.8fr)]">
        <div className="grid gap-2">
          <p className="ui-text-muted m-0 text-sm font-semibold">{t('ranking.pnl')}</p>
          <div className="flex min-w-0 flex-wrap items-end gap-x-4 gap-y-2">
            <p className="ui-rank-score m-0 text-3xl font-semibold leading-none md:text-4xl">
              {formatSignedUsdt(entry.netPnl)}
            </p>
            <span className="ui-state-success rounded-md border px-3 py-1 text-base font-semibold">
              {formatPercentRatio(entry.roi)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:text-right">
          <EntryMetric label="Won" value={String(entry.winCount)} />
          <EntryMetric label="Lose" value={String(entry.loseCount)} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
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
      <p className="ui-text-muted m-0 text-sm font-semibold">{label}</p>
      <p className="ui-text-strong mt-1 mb-0 truncate text-xl font-semibold">{value}</p>
    </div>
  )
}
