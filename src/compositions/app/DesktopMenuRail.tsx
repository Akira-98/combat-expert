import { useState } from 'react'
import { useGroupedSports } from '../../hooks/useGroupedSports'
import { useI18n } from '../../i18n'
import type { SportNavigationItem } from '../../types/ui'
import { SocialLinks } from '../SocialLinks'
import { DesktopStickyRail } from './DesktopSidebarLayout'
import { Chevron, SportLeagueMenu } from './SportsMenuShared'

type DesktopMenuRailProps = {
  gameStatusFilter: 'all' | 'live' | 'upcoming'
  sportFilter: string
  leagueFilter: string
  sports: SportNavigationItem[]
  liveSports: SportNavigationItem[]
  isRankingActive: boolean
  onSelectGameStatus: (value: 'all' | 'live' | 'upcoming') => void
  onSelectSport: (value: string) => void
  onSelectLiveSport: (value: string) => void
  onSelectLeague: (sportName: string, leagueName: string) => void
  onSelectLiveLeague: (sportName: string, leagueName: string) => void
  onOpenLeaderboard: () => void
}

export function DesktopMenuRail({
  gameStatusFilter,
  sportFilter,
  leagueFilter,
  sports,
  liveSports,
  isRankingActive,
  onSelectGameStatus,
  onSelectSport,
  onSelectLiveSport,
  onSelectLeague,
  onSelectLiveLeague,
  onOpenLeaderboard,
}: DesktopMenuRailProps) {
  const { t } = useI18n()
  const [isLiveOpen, setIsLiveOpen] = useState(false)
  const [isSportsOpen, setIsSportsOpen] = useState(false)
  const [isEsportsOpen, setIsEsportsOpen] = useState(false)
  const groupedSports = useGroupedSports(sports)
  const itemClass =
    'group flex min-h-11 w-full min-w-0 items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-left transition'
  const sectionButtonClass =
    'ui-text-strong flex min-h-11 w-full items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-left text-base font-black transition hover:bg-[color:var(--app-surface-soft)]'
  const activeClass = 'select-card-active'
  const idleClass = 'ui-text-body bg-transparent hover:bg-[color:var(--app-surface-soft)] hover:text-[color:var(--app-text-strong)]'

  const handleSelectSport = (sportName: string) => {
    onSelectGameStatus('upcoming')
    onSelectSport(sportName)
  }
  const handleSelectLiveSport = (sportName: string) => {
    onSelectLiveSport(sportName)
  }

  return (
    <DesktopStickyRail className="md:border-r md:border-[color:var(--app-border)] md:bg-[color:var(--app-surface)]">
      <nav aria-label={t('games.sports')} className="flex h-full flex-col gap-5 px-3 py-6">
        <div className="flex items-center justify-between gap-3">
          <p className="ui-text-strong m-0 text-lg font-black">{t('games.sports')}</p>
        </div>

        <div className="grid gap-1.5 overflow-y-auto px-1 py-1">
          <button className={sectionButtonClass} onClick={() => setIsLiveOpen((value) => !value)} type="button">
            <span className="flex w-7 shrink-0 items-center justify-center text-lg leading-none" aria-hidden="true">📡</span>
            <span className="min-w-0 flex-1 truncate">{t('games.live')}</span>
            <Chevron isOpen={isLiveOpen} />
          </button>
          {isLiveOpen ? (
            liveSports.length > 0 ? (
              <div className="grid min-w-0 gap-1 pl-1">
                <SportLeagueMenu
                  activeClass={activeClass}
                  gameStatusFilter={gameStatusFilter}
                  idleClass={idleClass}
                  itemClass={itemClass}
                  items={liveSports}
                  leagueFilter={leagueFilter}
                  mode="live"
                  sportFilter={sportFilter}
                  onSelectLeague={onSelectLiveLeague}
                  onSelectSport={handleSelectLiveSport}
                />
              </div>
            ) : (
              <p className="ui-text-muted m-0 px-3 py-2 text-xs font-semibold">{t('games.noLiveEvents')}</p>
            )
          ) : null}

          <button className={sectionButtonClass} onClick={() => setIsSportsOpen((value) => !value)} type="button">
            <span className="flex w-7 shrink-0 items-center justify-center text-lg leading-none" aria-hidden="true">🏆</span>
            <span className="min-w-0 flex-1 truncate">{t('games.sports')}</span>
            <Chevron isOpen={isSportsOpen} />
          </button>
          {isSportsOpen ? (
            <div className="grid min-w-0 gap-1 pl-1">
              <SportLeagueMenu
                activeClass={activeClass}
                gameStatusFilter={gameStatusFilter}
                idleClass={idleClass}
                itemClass={itemClass}
                items={groupedSports.sports}
                leagueFilter={leagueFilter}
                mode="upcoming"
                sportFilter={sportFilter}
                onSelectLeague={onSelectLeague}
                onSelectSport={handleSelectSport}
              />
            </div>
          ) : null}

          <button className={sectionButtonClass} onClick={() => setIsEsportsOpen((value) => !value)} type="button">
            <span className="flex w-7 shrink-0 items-center justify-center text-lg leading-none" aria-hidden="true">🎮</span>
            <span className="min-w-0 flex-1 truncate">{t('games.esports')}</span>
            <Chevron isOpen={isEsportsOpen} />
          </button>
          {isEsportsOpen ? (
            groupedSports.esports.length > 0 ? (
              <div className="grid min-w-0 gap-1 pl-1">
                <SportLeagueMenu
                  activeClass={activeClass}
                  gameStatusFilter={gameStatusFilter}
                  iconOverride="🎮"
                  idleClass={idleClass}
                  itemClass={itemClass}
                  items={groupedSports.esports}
                  leagueFilter={leagueFilter}
                  mode="upcoming"
                  sportFilter={sportFilter}
                  onSelectLeague={onSelectLeague}
                  onSelectSport={handleSelectSport}
                />
              </div>
            ) : (
              <p className="ui-text-muted m-0 px-3 py-2 text-xs font-semibold">{t('games.noEsports')}</p>
            )
          ) : null}

          <button
            aria-current={isRankingActive ? 'page' : undefined}
            className={`${itemClass} ${isRankingActive ? activeClass : idleClass}`}
            onClick={onOpenLeaderboard}
            type="button"
          >
            <span className="flex w-7 shrink-0 items-center justify-center text-lg leading-none" aria-hidden="true">🏅</span>
            <span className="min-w-0 flex-1 truncate text-sm font-black">{t('nav.leaderboard')}</span>
          </button>
        </div>

        <SocialLinks className="mt-auto border-t border-[color:var(--app-border)] pt-4" iconClassName="h-9 w-9" />
      </nav>
    </DesktopStickyRail>
  )
}
