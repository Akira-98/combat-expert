import { useI18n } from '../i18n'

type SocialLinksProps = {
  className?: string
  iconClassName?: string
}

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function SocialLinks({ className, iconClassName }: SocialLinksProps) {
  const { t } = useI18n()
  const buttonClassName = joinClasses(
    'ui-btn-secondary inline-flex items-center justify-center rounded-full border no-underline transition hover:translate-y-[-1px]',
    iconClassName ?? 'h-12 w-12',
  )

  return (
    <div className={joinClasses('flex items-center gap-3', className)}>
      <a
        aria-label={t('guide.telegram')}
        className={buttonClassName}
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
      <a
        aria-label={t('guide.discord')}
        className={buttonClassName}
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
      <a
        aria-label={t('guide.x')}
        className={buttonClassName}
        href="https://x.com/combatexpertXYZ"
        rel="noreferrer"
        target="_blank"
        title={t('guide.x')}
      >
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
          <path
            d="M6 5h3.1l3.2 4.7L16.2 5H19l-5.3 6.2L19.6 19h-3.1l-3.8-5.4L8 19H5.2l5.9-6.9L6 5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      </a>
    </div>
  )
}
