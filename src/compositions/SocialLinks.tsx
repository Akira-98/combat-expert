import { useI18n } from '../i18n'

type SocialLinksProps = {
  className?: string
  iconClassName?: string
}

const socialLinks = [
  {
    key: 'telegram',
    href: 'https://t.me/LegendaryChoi',
    imageSrc: '/Desktop/Logo.png',
    labelKey: 'guide.telegram',
  },
  {
    key: 'discord',
    href: 'https://discord.gg/kb7x9SH7M',
    imageSrc: '/Desktop/Discord-Symbol-Blurple.svg',
    labelKey: 'guide.discord',
  },
  {
    key: 'x',
    href: 'https://x.com/combatexpertXYZ',
    imageSrc: '/Desktop/logo-white.png',
    labelKey: 'guide.x',
  },
] as const

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
      {socialLinks.map((link) => {
        const label = t(link.labelKey)

        return (
          <a
            key={link.key}
            aria-label={label}
            className={buttonClassName}
            href={link.href}
            rel="noreferrer"
            target="_blank"
            title={label}
          >
            <img alt="" aria-hidden="true" className="h-6 w-6 object-contain" src={link.imageSrc} />
          </a>
        )
      })}
    </div>
  )
}
