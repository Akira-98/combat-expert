import { useI18n } from '../i18n'

export function RankingPage() {
  const { t } = useI18n()

  return (
    <section className="mt-2.5 grid min-h-[420px] place-items-center px-3">
      <div className="min-w-0 px-1">
        <h2 className="ui-text-strong m-0 text-[30px] font-semibold tracking-[0.14em] md:text-[40px]">
          {t('ranking.pageTitle')}
        </h2>
      </div>

      <div className="card-surface-soft card-shell-xl ui-border grid w-full max-w-[560px] gap-3 border px-5 py-10 text-center md:px-8 md:py-12">
        <p className="ui-text-strong m-0 text-2xl font-black md:text-3xl">{t('ranking.comingSoonTitle')}</p>
        <p className="ui-text-muted m-0 text-sm font-medium md:text-base">{t('ranking.comingSoonDescription')}</p>
      </div>
    </section>
  )
}
