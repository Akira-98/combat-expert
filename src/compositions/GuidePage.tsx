import { useI18n } from '../i18n'
import { SocialLinks } from './SocialLinks'

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
          <SocialLinks className="mt-3" />
        </article>
      </div>
    </section>
  )
}
