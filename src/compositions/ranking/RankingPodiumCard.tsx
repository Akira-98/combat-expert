import { shortenAddress } from '../../helpers/walletUi'
import type { RankingEntry } from '../../hooks/useRankings'

const podiumCardTones: Record<number, string> = {
  1: 'border-amber-300/45 bg-[linear-gradient(180deg,rgba(245,196,81,0.22)_0%,rgba(61,39,12,0.88)_58%,rgba(10,12,16,0.98)_100%)] shadow-[0_0_0_1px_rgba(245,196,81,0.18),0_18px_40px_-28px_rgba(245,196,81,0.45)]',
  2: 'border-slate-300/40 bg-[linear-gradient(180deg,rgba(203,213,225,0.2)_0%,rgba(51,65,85,0.82)_58%,rgba(10,12,16,0.98)_100%)] shadow-[0_0_0_1px_rgba(203,213,225,0.16),0_18px_40px_-28px_rgba(148,163,184,0.38)]',
  3: 'border-orange-400/40 bg-[linear-gradient(180deg,rgba(199,123,74,0.24)_0%,rgba(74,38,20,0.84)_58%,rgba(10,12,16,0.98)_100%)] shadow-[0_0_0_1px_rgba(199,123,74,0.18),0_18px_40px_-28px_rgba(180,83,9,0.42)]',
}

export function RankingPodiumCard({ entry, rank }: { entry: RankingEntry; rank: number }) {
  const podiumCardTone =
    podiumCardTones[rank] ??
    'border-[color:var(--app-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.015)_100%)] shadow-[0_0_0_1px_color-mix(in_oklab,var(--app-border)_24%,transparent)]'

  return (
    <article
      className={`relative overflow-hidden rounded-3xl border p-4 ${podiumCardTone}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-3 inline-flex rounded-full border border-white/14 bg-black/24 px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] text-slate-100">
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
      <div className="mt-5 border-t border-white/6 pt-3">
        <div>
          <p className="ui-text-muted m-0 text-[10px] font-medium uppercase tracking-[0.18em]">Record</p>
          <p className="ui-text-strong mt-1 mb-0 text-sm font-medium">
            {entry.winCount}승 {entry.loseCount}패{entry.voidCount > 0 ? ` · 무효 ${entry.voidCount}` : ''}
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
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300">
      <span>적중 {entry.winCount}</span>
      <span>미적중 {entry.loseCount}</span>
      <span>언더독 {entry.underdogHitCount}</span>
      <span>총 {entry.eventCount}건</span>
    </div>
  )
}
