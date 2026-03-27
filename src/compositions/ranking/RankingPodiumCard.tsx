import { shortenAddress } from '../../helpers/walletUi'
import type { RankingEntry } from '../../hooks/useRankings'
import { useI18n } from '../../i18n'

const podiumCardTones: Record<number, string> = {
  1: 'ui-podium-tone-gold',
  2: 'ui-podium-tone-silver',
  3: 'ui-podium-tone-bronze',
}

export function RankingPodiumCard({ entry, rank }: { entry: RankingEntry; rank: number }) {
  const { t } = useI18n()
  const podiumCardTone = podiumCardTones[rank] ?? 'ui-podium-tone-default'

  return (
    <article
      className={`relative overflow-hidden rounded-3xl border p-4 ${podiumCardTone}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="ui-podium-badge ui-text-strong mb-3 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em]">
            #{rank}
          </div>
          <p className="ui-text-strong m-0 truncate text-lg font-semibold md:text-xl">{entry.nickname || shortenAddress(entry.address, 6, 4)}</p>
          <p className="ui-text-muted mt-1 mb-0 truncate text-sm">{shortenAddress(entry.address, 7, 5)}</p>
        </div>
        <div className="text-right">
          <p className="ui-text-muted m-0 text-[10px] font-medium uppercase tracking-[0.18em]">Score</p>
          <p className="ui-text-strong mt-1 mb-0 text-3xl font-semibold leading-none md:text-[2rem]">{entry.totalScore.toFixed(1)}</p>
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
