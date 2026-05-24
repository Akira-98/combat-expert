import { useI18n } from '../i18n'
import { useRankings } from '../hooks/useRankings'
import { RankingLeaderboardRow } from './ranking/RankingLeaderboardRow'

type RankingPageProps = {
  address?: `0x${string}`
}

export function RankingPage({ address }: RankingPageProps) {
  const { t } = useI18n()
  const { rankings, viewer, isLoading, errorMessage } = useRankings(address)

  return (
    <section className="mt-2.5 grid gap-4 px-3">
      <div className="min-w-0 px-1 text-center md:text-left">
        <h2 className="ui-text-strong m-0 text-[30px] font-semibold tracking-[0.14em] md:text-[40px]">
          {t('ranking.pageTitle')}
        </h2>
        <p className="ui-text-muted mt-1 mb-0 text-sm font-medium">{t('ranking.pageDescription')}</p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-3">
          <div className="card-surface-soft card-shell-xl h-56" />
          <div className="card-surface-soft card-shell-xl h-56" />
          <div className="card-surface-soft card-shell-xl h-56" />
        </div>
      ) : errorMessage ? (
        <div className="ui-state-danger rounded-2xl border p-4">
          <p className="m-0 text-sm font-semibold">{errorMessage}</p>
        </div>
      ) : rankings.length === 0 ? (
        <div className="card-surface-soft card-shell-xl ui-border border px-5 py-10 text-center">
          <p className="ui-text-strong m-0 text-xl font-bold">{t('ranking.noData')}</p>
          <p className="ui-text-muted mt-2 mb-0 text-sm">{t('ranking.noDataDesc')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rankings.map((entry, index) => (
            <RankingLeaderboardRow key={entry.address} entry={entry} rank={index + 1} isViewer={entry.address === viewer?.address} />
          ))}
        </div>
      )}
    </section>
  )
}
