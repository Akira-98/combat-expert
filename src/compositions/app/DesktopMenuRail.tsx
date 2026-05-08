import { useMemo, useState } from 'react'
import { getSportIcon } from '../../helpers/sports'
import { useI18n } from '../../i18n'
import type { SportFilterItem } from '../../types/ui'
import { SocialLinks } from '../SocialLinks'
import { DesktopStickyRail } from './DesktopSidebarLayout'

type DesktopMenuRailProps = {
  gameStatusFilter: 'all' | 'live' | 'upcoming'
  sportFilter: string
  sports: SportFilterItem[]
  liveSports: SportFilterItem[]
  isRankingActive: boolean
  onSelectGameStatus: (value: 'all' | 'live' | 'upcoming') => void
  onSelectSport: (value: string) => void
  onSelectLiveSport: (value: string) => void
  onOpenLeaderboard: () => void
}

function Chevron({ isOpen }: { isOpen: boolean }) {
  return (
    <svg aria-hidden="true" className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}

export function DesktopMenuRail({
  gameStatusFilter,
  sportFilter,
  sports,
  liveSports,
  isRankingActive,
  onSelectGameStatus,
  onSelectSport,
  onSelectLiveSport,
  onOpenLeaderboard,
}: DesktopMenuRailProps) {
  const { t } = useI18n()
  const [isLiveOpen, setIsLiveOpen] = useState(true)
  const [isSportsOpen, setIsSportsOpen] = useState(true)
  const [isEsportsOpen, setIsEsportsOpen] = useState(true)
  const groupedSports = useMemo(
    () => ({
      sports: sports.filter((sport) => sport.hub !== 'esports'),
      esports: sports.filter((sport) => sport.hub === 'esports'),
    }),
    [sports],
  )
  const itemClass =
    'group flex min-h-11 w-full items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-left transition'
  const sectionButtonClass =
    'ui-text-strong flex min-h-11 w-full items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-left text-base font-black transition hover:bg-[color:var(--app-surface-soft)]'
  const activeClass = 'select-card-active'
  const idleClass = 'ui-text-body bg-transparent hover:bg-[color:var(--app-surface-soft)] hover:text-[color:var(--app-text-strong)]'

  const handleSelectSport = (sportName: string) => {
    onSelectGameStatus('all')
    onSelectSport(sportName)
  }
  const handleSelectLiveSport = (sportName: string) => {
    onSelectLiveSport(sportName)
  }

  const renderSports = (items: SportFilterItem[], mode: 'all' | 'live', iconOverride?: string) =>
    items.map((sport) => {
      const isActive = mode === 'live'
        ? gameStatusFilter === 'live' && sportFilter === sport.name
        : gameStatusFilter !== 'live' && sportFilter === sport.name
      return (
        <button
          key={sport.name}
          aria-current={isActive ? 'page' : undefined}
          className={`${itemClass} ${isActive ? activeClass : idleClass}`}
          onClick={() => mode === 'live' ? handleSelectLiveSport(sport.name) : handleSelectSport(sport.name)}
          type="button"
        >
          <span className="flex w-7 shrink-0 items-center justify-center text-lg leading-none">
            <span aria-hidden="true">{iconOverride ?? getSportIcon(sport.name)}</span>
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-black">{sport.name}</span>
          <span className="shrink-0 text-xs font-bold tabular-nums">{sport.count}</span>
        </button>
      )
    })

  return (
    <DesktopStickyRail className="md:border-r md:border-[color:var(--app-border)] md:bg-[color:var(--app-surface)]">
      <nav aria-label={t('games.sports')} className="flex h-full flex-col gap-5 px-3 py-6">
        <div className="flex items-center justify-between gap-3">
          <p className="ui-text-strong m-0 text-lg font-black">{t('games.sports')}</p>
        </div>

        <div className="grid gap-1.5 overflow-y-auto pr-1">
          <button className={sectionButtonClass} onClick={() => setIsLiveOpen((value) => !value)} type="button">
            <span className="flex w-7 shrink-0 items-center justify-center text-lg leading-none" aria-hidden="true">📡</span>
            <span className="min-w-0 flex-1 truncate">{t('games.live')}</span>
            <Chevron isOpen={isLiveOpen} />
          </button>
          {isLiveOpen ? (
            liveSports.length > 0 ? (
              <div className="grid gap-1 pl-1">{renderSports(liveSports, 'live')}</div>
            ) : (
              <p className="ui-text-muted m-0 px-3 py-2 text-xs font-semibold">{t('games.noLiveEvents')}</p>
            )
          ) : null}

          <button className={sectionButtonClass} onClick={() => setIsSportsOpen((value) => !value)} type="button">
            <span className="flex w-7 shrink-0 items-center justify-center text-lg leading-none" aria-hidden="true">🏆</span>
            <span className="min-w-0 flex-1 truncate">{t('games.sports')}</span>
            <Chevron isOpen={isSportsOpen} />
          </button>
          {isSportsOpen ? <div className="grid gap-1 pl-1">{renderSports(groupedSports.sports, 'all')}</div> : null}

          <button className={sectionButtonClass} onClick={() => setIsEsportsOpen((value) => !value)} type="button">
            <span className="flex w-7 shrink-0 items-center justify-center text-lg leading-none" aria-hidden="true">🎮</span>
            <span className="min-w-0 flex-1 truncate">{t('games.esports')}</span>
            <Chevron isOpen={isEsportsOpen} />
          </button>
          {isEsportsOpen ? (
            groupedSports.esports.length > 0 ? (
              <div className="grid gap-1 pl-1">{renderSports(groupedSports.esports, 'all', '🎮')}</div>
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
