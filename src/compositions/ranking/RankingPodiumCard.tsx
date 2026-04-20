import { getWalletAvatarUrl, shortenAddress } from '../../helpers/walletUi'
import type { RankingEntry } from '../../hooks/useRankings'
import { useI18n } from '../../i18n'

const trophyColorClassNames: Record<number, string> = {
  1: 'text-[#f5c84c]',
  2: 'text-[#c7d0d9]',
  3: 'text-[#c9854a]',
}

export function RankingPodiumCard({ entry, rank }: { entry: RankingEntry; rank: number }) {
  const { t } = useI18n()
  const trophyColorClassName = trophyColorClassNames[rank] ?? 'ui-text-muted'

  return (
    <article
      className="card-shell-lg ui-elevated-card relative overflow-hidden border border-[color:var(--app-border)] p-4"
    >
      <div className="grid gap-3">
        <TrophyIcon className={`h-7 w-7 ${trophyColorClassName}`} />
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <img alt="" className="h-9 w-9 shrink-0 rounded-full border object-cover" src={getWalletAvatarUrl(entry.address)} />
            <div className="flex min-w-0 items-center gap-2">
              <span className="ui-text-muted shrink-0 text-sm font-bold">
                #{rank}
              </span>
              <p className="ui-text-strong m-0 truncate text-lg font-semibold md:text-xl">{entry.nickname || shortenAddress(entry.address, 6, 4)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="ui-text-muted m-0 text-[10px] font-medium uppercase tracking-[0.18em]">Score</p>
            <p className="ui-text-strong mt-1 mb-0 text-3xl font-semibold leading-none md:text-[2rem]">{entry.totalScore.toFixed(1)}</p>
          </div>
        </div>
      </div>
      <div className="ui-divider-faint mt-5 border-t pt-3">
        <div>
          <p className="ui-text-muted m-0 text-[10px] font-medium uppercase tracking-[0.18em]">{t('ranking.record')}</p>
          <p className="ui-text-strong mt-1 mb-0 text-sm font-medium">
            {t('ranking.winsLosses', { wins: entry.winCount, losses: entry.loseCount })}
            {entry.voidCount > 0 ? ` · ${t('ranking.void', { count: entry.voidCount })}` : ''}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <EntryMetrics entry={entry} />
      </div>
    </article>
  )
}

function TrophyIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M8 4h8v2h4v3a5 5 0 0 1-4.9 5A5.5 5.5 0 0 1 13 15.9V18h3v2H8v-2h3v-2.1A5.5 5.5 0 0 1 8.9 14 5 5 0 0 1 4 9V6h4V4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      <path d="M8 6v4a4 4 0 0 0 8 0V6M6 8v1a3 3 0 0 0 2.6 3M18 8v1a3 3 0 0 1-2.6 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  )
}

function EntryMetrics({ entry }: { entry: RankingEntry }) {
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
