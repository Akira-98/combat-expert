import { useMemo, useState } from 'react'
import { getSportIcon } from '../../helpers/sports'
import { useI18n } from '../../i18n'
import type { SportNavigationItem } from '../../types/ui'

const COUNTRY_FLAG_BY_SLUG: Record<string, string> = {
  argentina: '🇦🇷',
  australia: '🇦🇺',
  austria: '🇦🇹',
  belgium: '🇧🇪',
  brazil: '🇧🇷',
  canada: '🇨🇦',
  chile: '🇨🇱',
  china: '🇨🇳',
  colombia: '🇨🇴',
  croatia: '🇭🇷',
  denmark: '🇩🇰',
  england: '🏴',
  finland: '🇫🇮',
  france: '🇫🇷',
  germany: '🇩🇪',
  greece: '🇬🇷',
  india: '🇮🇳',
  ireland: '🇮🇪',
  italy: '🇮🇹',
  japan: '🇯🇵',
  mexico: '🇲🇽',
  netherlands: '🇳🇱',
  norway: '🇳🇴',
  poland: '🇵🇱',
  portugal: '🇵🇹',
  scotland: '🏴',
  serbia: '🇷🇸',
  spain: '🇪🇸',
  sweden: '🇸🇪',
  switzerland: '🇨🇭',
  turkey: '🇹🇷',
  ukraine: '🇺🇦',
  'united-arab-emirates': '🇦🇪',
  'united-states': '🇺🇸',
  usa: '🇺🇸',
  wales: '🏴',
}

const getCountryFlag = (countrySlug?: string, countryName?: string) => {
  const normalizedSlug = countrySlug?.trim().toLowerCase()
  if (!normalizedSlug || normalizedSlug.includes('international')) return '🌐'
  const normalizedName = countryName?.trim().toLowerCase()
  return COUNTRY_FLAG_BY_SLUG[normalizedSlug] ?? (normalizedName ? COUNTRY_FLAG_BY_SLUG[normalizedName.replaceAll(' ', '-')] : undefined) ?? '🌐'
}

export function Chevron({ isOpen }: { isOpen: boolean }) {
  return (
    <svg aria-hidden="true" className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}

type SportLeagueMenuProps = {
  items: SportNavigationItem[]
  mode: 'live' | 'upcoming'
  gameStatusFilter: 'all' | 'live' | 'upcoming'
  sportFilter: string
  leagueFilter: string
  itemClass: string
  activeClass: string
  idleClass: string
  iconOverride?: string
  onSelectSport: (sportName: string) => void
  onSelectLeague: (sportName: string, leagueName: string) => void
}

export function SportLeagueMenu({
  items,
  mode,
  gameStatusFilter,
  sportFilter,
  leagueFilter,
  itemClass,
  activeClass,
  idleClass,
  iconOverride,
  onSelectSport,
  onSelectLeague,
}: SportLeagueMenuProps) {
  const { t } = useI18n()
  const [openSports, setOpenSports] = useState<Record<string, boolean>>({})
  const statusMatches = gameStatusFilter === mode
  const visibleItems = useMemo(
    () => items.map((sport) => ({
      ...sport,
      leagues: [...sport.leagues].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'en')),
    })),
    [items],
  )

  const toggleSport = (sportName: string) => {
    setOpenSports((current) => ({
      ...current,
      [sportName]: !current[sportName],
    }))
  }

  return (
    <div className="grid min-w-0 gap-1">
      {visibleItems.map((sport) => {
        const isOpen = Boolean(openSports[sport.name])
        const isSportActive = statusMatches && sportFilter === sport.name
        const isAllSportActive = isSportActive && leagueFilter === 'all'

        return (
          <div className="grid min-w-0 gap-1" key={sport.name}>
            <button
              aria-expanded={isOpen}
              className={`${itemClass} min-w-0 max-w-full overflow-hidden ${isSportActive ? activeClass : idleClass}`}
              onClick={() => toggleSport(sport.name)}
              type="button"
            >
              <span className="flex w-7 shrink-0 items-center justify-center text-lg leading-none">
                <span aria-hidden="true">{iconOverride ?? getSportIcon(sport.name)}</span>
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-black">{sport.name}</span>
              <span className="shrink-0 text-xs font-bold tabular-nums">{sport.count}</span>
              <Chevron isOpen={isOpen} />
            </button>
            {isOpen ? (
              <div className="grid min-w-0 gap-1 pl-4">
                <button
                  aria-current={isAllSportActive ? 'page' : undefined}
                  className={`flex min-h-9 w-full min-w-0 max-w-full items-center gap-2 overflow-hidden rounded-lg border border-transparent px-3 py-1.5 text-left text-xs font-bold transition ${
                    isAllSportActive ? activeClass : idleClass
                  }`}
                  onClick={() => onSelectSport(sport.name)}
                  type="button"
                >
                  <span className="min-w-0 flex-1 truncate">{t('games.all')}</span>
                  <span className="shrink-0 text-[11px] font-bold tabular-nums">{sport.count}</span>
                </button>
                {sport.leagues.map((league) => {
                  const isLeagueActive = isSportActive && leagueFilter === league.name
                  return (
                    <button
                      aria-current={isLeagueActive ? 'page' : undefined}
                      className={`flex min-h-9 w-full min-w-0 max-w-full items-center gap-2 overflow-hidden rounded-lg border border-transparent px-3 py-1.5 text-left text-xs font-bold transition ${
                        isLeagueActive ? activeClass : idleClass
                      }`}
                      key={`${sport.name}-${league.name}`}
                      onClick={() => onSelectLeague(sport.name, league.name)}
                      type="button"
                    >
                      <span className="flex w-6 shrink-0 items-center justify-center text-base leading-none" aria-hidden="true">
                        {getCountryFlag(league.countrySlug, league.countryName)}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{league.name}</span>
                      <span className="shrink-0 text-[11px] font-bold tabular-nums">{league.count}</span>
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
