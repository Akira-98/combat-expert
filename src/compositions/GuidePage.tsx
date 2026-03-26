import { useI18n } from '../i18n'

export function GuidePage() {
  const { t } = useI18n()
  const steps = [
    {
      step: 'Step 1',
      title: t('guide.step1.title'),
      summary: t('guide.step1.summary'),
      points: [t('guide.step1.point1'), t('guide.step1.point2')],
    },
    {
      step: 'Step 2',
      title: t('guide.step2.title'),
      summary: t('guide.step2.summary'),
      points: [t('guide.step2.point1'), t('guide.step2.point2')],
    },
    {
      step: 'Step 3',
      title: t('guide.step3.title'),
      summary: t('guide.step3.summary'),
      points: [t('guide.step3.point1'), t('guide.step3.point2')],
    },
  ] as const

  return (
    <section className="mt-2 grid gap-3 md:mt-3 md:gap-4">
      <div>
        <div>
          <p className="ui-text-muted m-0 text-xs font-semibold uppercase tracking-[0.18em]">{t('guide.eyebrow')}</p>
          <h2 className="ui-text-strong mt-1 text-xl font-semibold">{t('guide.title')}</h2>
        </div>
      </div>

      <div className="grid gap-2.5 md:grid-cols-3">
        {steps.map((item) => (
          <article key={item.title} className="card-surface-soft card-shell-lg p-4">
            <p className="ui-text-muted m-0 text-[11px] font-semibold uppercase tracking-[0.14em]">{item.step}</p>
            <h3 className="ui-text-strong mt-1 text-base font-semibold">{item.title}</h3>
            <p className="ui-text-muted mt-3 text-sm">{item.summary}</p>
            <ul className="ui-text-muted mt-2.5 grid gap-1.5 pl-5 text-sm">
              {item.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="grid gap-2.5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <article className="card-surface-soft card-shell-lg border-amber-400/30 p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-amber-600">{t('guide.important')}</p>
          <h3 className="ui-text-strong mt-2 text-base font-semibold">{t('guide.checkpoints')}</h3>
          <ul className="ui-text-muted mt-3 grid gap-2 pl-5 text-sm">
            <li>{t('guide.checkpoint1')}</li>
            <li>{t('guide.checkpoint2')}</li>
            <li>{t('guide.checkpoint3')}</li>
          </ul>
        </article>
        <article className="card-surface-soft card-shell-lg p-4">
          <p className="ui-text-strong m-0 text-sm font-semibold">{t('guide.contactTitle')}</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <a
                aria-label={t('guide.telegram')}
                className="ui-btn-secondary inline-flex h-12 w-12 items-center justify-center rounded-full border no-underline transition hover:translate-y-[-1px]"
                href="https://t.me/LegendaryChoi"
                rel="noreferrer"
                target="_blank"
                title={t('guide.telegram')}
              >
                <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M21 5 3.8 11.6c-.8.3-.8 1.4 0 1.7l4.4 1.4 1.4 4.4c.3.8 1.4.8 1.7 0L18 1.9c.3-.8-.5-1.6-1.3-1.3Z"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                  <path d="m8 14 10-10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                </svg>
              </a>
              <span className="ui-text-muted text-xs">{t('guide.directMessage')}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <a
                aria-label={t('guide.discord')}
                className="ui-btn-secondary inline-flex h-12 w-12 items-center justify-center rounded-full border no-underline transition hover:translate-y-[-1px]"
                href="https://discord.gg/kb7x9SH7M"
                rel="noreferrer"
                target="_blank"
                title={t('guide.discord')}
              >
                <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M8.7 7.6A14.6 14.6 0 0 1 12 7c1.1 0 2.2.2 3.3.6l.7 1.5c1.8.2 3.1 1.1 3.6 2.8.4 1.4.3 3-.4 4.8a9.7 9.7 0 0 1-3.3 1.7l-.8-1.3c.5-.2 1-.4 1.4-.7-.1.1-.2.1-.3.2A10.3 10.3 0 0 1 12 18c-1.5 0-2.9-.3-4.2-.9l-.3-.2c.4.3.9.5 1.4.7l-.8 1.3a9.7 9.7 0 0 1-3.3-1.7c-.7-1.8-.8-3.4-.4-4.8.5-1.7 1.8-2.6 3.6-2.8l.7-1.5Z"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                  <path d="M9.4 12.3h.1m5 0h.1" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
                </svg>
              </a>
              <span className="ui-text-muted text-xs">{t('guide.community')}</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
