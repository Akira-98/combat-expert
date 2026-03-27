import { useI18n } from '../../i18n'

type HeaderNavButtonsProps = {
  onGuideClick: () => void
  onRankingClick: () => void
  onWalletClick: () => void
  onToggleLocale: () => void
  showGuideOnMobile?: boolean
  showRankingOnMobile?: boolean
  showWalletOnMobile?: boolean
}

export function HeaderNavButtons({
  onGuideClick,
  onRankingClick,
  onWalletClick,
  onToggleLocale,
  showGuideOnMobile = false,
  showRankingOnMobile = false,
  showWalletOnMobile = false,
}: HeaderNavButtonsProps) {
  const { locale, t } = useI18n()
  const getNavButtonClass = (isVisibleOnMobile: boolean) =>
    `ui-ghost-icon h-9 w-9 items-center justify-center rounded-full text-sm transition ${
      isVisibleOnMobile ? 'inline-flex md:inline-flex' : 'hidden md:inline-flex'
    }`

  return (
    <>
      <button aria-label={t('nav.wallet')} className={getNavButtonClass(showWalletOnMobile)} onClick={onWalletClick} title={t('nav.wallet')} type="button">
        <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M7 7h11" strokeLinecap="round" />
          <path d="m14 4 4 3-4 3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 17H6" strokeLinecap="round" />
          <path d="m10 14-4 3 4 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button aria-label={t('nav.ranking')} className={getNavButtonClass(showRankingOnMobile)} onClick={onRankingClick} title={t('nav.ranking')} type="button">
        <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M8 21h8" strokeLinecap="round" />
          <path d="M12 16v5" strokeLinecap="round" />
          <path d="M7 4h10v3a5 5 0 0 1-10 0V4Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 6H5a2 2 0 0 0 2 2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 6h2a2 2 0 0 1-2 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button aria-label={t('nav.guide')} className={getNavButtonClass(showGuideOnMobile)} onClick={onGuideClick} title={t('nav.guide')} type="button">
        <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M6 5.75A2.75 2.75 0 0 1 8.75 3H19v16H8.75A2.75 2.75 0 0 0 6 21Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 5.75v15.5" strokeLinecap="round" />
          <path d="M9.5 7.5h6M9.5 11h6M9.5 14.5h4" strokeLinecap="round" />
        </svg>
      </button>
      <button aria-label={t('nav.languageToggle')} className="ui-ghost-icon inline-flex h-9 min-w-11 items-center justify-center rounded-full px-2 text-[11px] font-semibold transition" onClick={onToggleLocale} title={t('common.language')} type="button">
        {locale.toUpperCase()}
      </button>
    </>
  )
}
