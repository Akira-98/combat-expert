type HeaderNavButtonsProps = {
  onGuideClick: () => void
  onRankingClick: () => void
  onWalletClick: () => void
  showGuideOnMobile?: boolean
  showRankingOnMobile?: boolean
  showWalletOnMobile?: boolean
}

export function HeaderNavButtons({
  onGuideClick,
  onRankingClick,
  onWalletClick,
  showGuideOnMobile = false,
  showRankingOnMobile = false,
  showWalletOnMobile = false,
}: HeaderNavButtonsProps) {
  const getNavButtonClass = (isVisibleOnMobile: boolean) =>
    `ui-text-body h-9 w-9 items-center justify-center rounded-full bg-transparent text-sm transition hover:bg-black/5 dark:hover:bg-white/5 ${
      isVisibleOnMobile ? 'inline-flex md:inline-flex' : 'hidden md:inline-flex'
    }`

  return (
    <>
      <button aria-label="입출금" className={getNavButtonClass(showWalletOnMobile)} onClick={onWalletClick} title="입출금" type="button">
        <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M7 7h11" strokeLinecap="round" />
          <path d="m14 4 4 3-4 3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 17H6" strokeLinecap="round" />
          <path d="m10 14-4 3 4 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button aria-label="랭킹" className={getNavButtonClass(showRankingOnMobile)} onClick={onRankingClick} title="랭킹" type="button">
        <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M8 21h8" strokeLinecap="round" />
          <path d="M12 16v5" strokeLinecap="round" />
          <path d="M7 4h10v3a5 5 0 0 1-10 0V4Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 6H5a2 2 0 0 0 2 2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 6h2a2 2 0 0 1-2 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button aria-label="가이드" className={getNavButtonClass(showGuideOnMobile)} onClick={onGuideClick} title="가이드" type="button">
        <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M6 5.75A2.75 2.75 0 0 1 8.75 3H19v16H8.75A2.75 2.75 0 0 0 6 21Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 5.75v15.5" strokeLinecap="round" />
          <path d="M9.5 7.5h6M9.5 11h6M9.5 14.5h4" strokeLinecap="round" />
        </svg>
      </button>
    </>
  )
}
