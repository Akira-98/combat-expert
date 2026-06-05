import { createPortal } from 'react-dom'
import { useState } from 'react'
import { useGroupedSports } from '../../hooks/useGroupedSports'
import { useI18n } from '../../i18n'
import type { SportNavigationItem } from '../../types/ui'
import { SocialLinks } from '../SocialLinks'
import { Chevron, SportLeagueMenu } from './SportsMenuShared'

type MobileMenuSheetProps = {
  isOpen: boolean
  gameStatusFilter: 'all' | 'live' | 'upcoming'
  sportFilter: string
  leagueFilter: string
  sports: SportNavigationItem[]
  liveSports: SportNavigationItem[]
  onClose: () => void
  onSelectGameStatus: (value: 'all' | 'live' | 'upcoming') => void
  onSelectSport: (value: string) => void
  onSelectLiveSport: (value: string) => void
  onSelectLeague: (sportName: string, leagueName: string) => void
  onSelectLiveLeague: (sportName: string, leagueName: string) => void
}

export function MobileMenuSheet({
  isOpen,
  gameStatusFilter,
  sportFilter,
  leagueFilter,
  sports,
  liveSports,
  onClose,
  onSelectGameStatus,
  onSelectSport,
  onSelectLiveSport,
  onSelectLeague,
  onSelectLiveLeague,
}: MobileMenuSheetProps) {
  const { t } = useI18n()
  const [isLiveOpen, setIsLiveOpen] = useState(false)
  const [isSportsOpen, setIsSportsOpen] = useState(false)
  const [isEsportsOpen, setIsEsportsOpen] = useState(false)
  const groupedSports = useGroupedSports(sports)
  if (!isOpen || typeof document === 'undefined') return null

  const menuButtonClass =
    'flex min-h-11 w-full min-w-0 items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left transition'
  const activeClass = 'select-card-active'
  const idleClass = 'ui-text-body bg-transparent hover:bg-[color:var(--app-surface)] hover:text-[color:var(--app-text-strong)]'
  const sectionButtonClass =
    'ui-text-strong flex min-h-11 w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left text-base font-black transition hover:bg-[color:var(--app-surface)]'
  const selectSport = (value: string) => {
    onSelectGameStatus('upcoming')
    onSelectSport(value)
    onClose()
  }
  const selectLiveSport = (value: string) => {
    onSelectLiveSport(value)
    onClose()
  }
  const selectLeague = (sportName: string, leagueName: string) => {
    onSelectLeague(sportName, leagueName)
    onClose()
  }
  const selectLiveLeague = (sportName: string, leagueName: string) => {
    onSelectLiveLeague(sportName, leagueName)
    onClose()
  }

  return createPortal(
    <div aria-modal="true" className="fixed inset-0 z-[72] xl:hidden" role="dialog">
      <button
        aria-label={t('menu.close')}
        className="ui-overlay-scrim absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <aside className="ui-surface-soft absolute inset-y-0 right-0 flex w-[min(84vw,340px)] flex-col border-l p-4 shadow-2xl">
        <div className="flex items-center gap-2">
          <p className="ui-text-strong m-0 min-w-0 flex-1 text-base font-semibold">{t('games.sports')}</p>
          <button className="ui-btn-secondary btn-shell inline-flex h-8 w-8 items-center justify-center" onClick={onClose} type="button">
            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.8" />
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
        </div>

        <div className="mt-5 grid gap-1.5 overflow-y-auto px-1 py-1">
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
                  itemClass={menuButtonClass}
                  items={liveSports}
                  leagueFilter={leagueFilter}
                  mode="live"
                  sportFilter={sportFilter}
                  onSelectLeague={selectLiveLeague}
                  onSelectSport={selectLiveSport}
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
                itemClass={menuButtonClass}
                items={groupedSports.sports}
                leagueFilter={leagueFilter}
                mode="upcoming"
                sportFilter={sportFilter}
                onSelectLeague={selectLeague}
                onSelectSport={selectSport}
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
                  itemClass={menuButtonClass}
                  items={groupedSports.esports}
                  leagueFilter={leagueFilter}
                  mode="upcoming"
                  sportFilter={sportFilter}
                  onSelectLeague={selectLeague}
                  onSelectSport={selectSport}
                />
              </div>
            ) : (
              <p className="ui-text-muted m-0 px-3 py-2 text-xs font-semibold">{t('games.noEsports')}</p>
            )
          ) : null}
        </div>

        <SocialLinks className="mt-auto border-t border-[color:var(--app-border)] pt-4" iconClassName="h-10 w-10" />
      </aside>
    </div>,
    document.body,
  )
}
