import { useI18n } from '../../i18n'
import { SocialLinks } from '../SocialLinks'
import { DesktopStickyRail } from './DesktopSidebarLayout'

type DesktopMenuRailProps = {
  isExploreActive: boolean
  isRankingActive: boolean
  isGuideActive: boolean
  previewPage?: 'player-rankings'
  onOpenExplore: () => void
  onOpenPlayerRankings: () => void
  onOpenLeaderboard: () => void
  onOpenGuide: () => void
}

export function DesktopMenuRail({
  isExploreActive,
  isRankingActive,
  isGuideActive,
  previewPage,
  onOpenExplore,
  onOpenPlayerRankings,
  onOpenLeaderboard,
  onOpenGuide,
}: DesktopMenuRailProps) {
  const { t } = useI18n()
  const items = [
    {
      label: t('bottomNav.explore'),
      isActive: isExploreActive,
      onClick: onOpenExplore,
    },
    {
      label: t('nav.playerRankings'),
      isActive: previewPage === 'player-rankings',
      onClick: onOpenPlayerRankings,
    },
    {
      label: t('nav.leaderboard'),
      isActive: isRankingActive,
      onClick: onOpenLeaderboard,
    },
    {
      label: t('nav.guide'),
      isActive: isGuideActive,
      onClick: onOpenGuide,
    },
  ]

  return (
    <DesktopStickyRail className="md:border-r md:border-[color:var(--app-border)] md:bg-[color:var(--app-surface)]">
      <nav aria-label={t('common.menu')} className="flex h-full flex-col gap-5 px-5 py-6">
        <p className="ui-text-muted m-0 text-[11px] font-black uppercase tracking-[0.14em]">{t('common.menu')}</p>

        <div className="grid gap-1">
          {items.map((item) => (
            <button
              key={item.label}
              aria-current={item.isActive ? 'page' : undefined}
              className={`relative border-0 bg-transparent py-2.5 pl-4 pr-1 text-left text-sm font-black uppercase tracking-[0.08em] transition ${
                item.isActive
                  ? 'ui-text-strong'
                  : 'ui-text-muted hover:text-[color:var(--app-text-strong)]'
              }`}
              onClick={item.onClick}
              type="button"
            >
              <span
                aria-hidden
                className={`absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full transition ${
                  item.isActive ? 'bg-[color:var(--app-accent)] opacity-100' : 'bg-transparent opacity-0'
                }`}
              />
              {item.label}
            </button>
          ))}
        </div>

        <SocialLinks className="mt-auto border-t border-[color:var(--app-border)] pt-4" iconClassName="h-9 w-9" />
      </nav>
    </DesktopStickyRail>
  )
}
