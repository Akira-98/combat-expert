import { createPortal } from 'react-dom'
import { useMemo, useState } from 'react'
import { getSportIcon } from '../../helpers/sports'
import { useI18n } from '../../i18n'
import type { SportFilterItem } from '../../types/ui'
import { SocialLinks } from '../SocialLinks'

type MobileMenuSheetProps = {
  isOpen: boolean
  gameStatusFilter: 'all' | 'live' | 'upcoming'
  sportFilter: string
  sports: SportFilterItem[]
  liveSports: SportFilterItem[]
  onClose: () => void
  onSelectGameStatus: (value: 'all' | 'live' | 'upcoming') => void
  onSelectSport: (value: string) => void
  onSelectLiveSport: (value: string) => void
}

function Chevron({ isOpen }: { isOpen: boolean }) {
  return (
    <svg aria-hidden="true" className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}

export function MobileMenuSheet({
  isOpen,
  gameStatusFilter,
  sportFilter,
  sports,
  liveSports,
  onClose,
  onSelectGameStatus,
  onSelectSport,
  onSelectLiveSport,
}: MobileMenuSheetProps) {
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
  if (!isOpen || typeof document === 'undefined') return null

  const menuButtonClass =
    'flex min-h-11 w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left transition'
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
  const renderSports = (items: SportFilterItem[], mode: 'all' | 'live', iconOverride?: string) =>
    items.map((sport) => {
      const isActive = mode === 'live'
        ? gameStatusFilter === 'live' && sportFilter === sport.name
        : gameStatusFilter === 'upcoming' && sportFilter === sport.name
      return (
        <button
          key={sport.name}
          aria-current={isActive ? 'page' : undefined}
          className={`${menuButtonClass} ${isActive ? activeClass : idleClass}`}
          onClick={() => mode === 'live' ? selectLiveSport(sport.name) : selectSport(sport.name)}
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

        <div className="mt-5 grid gap-1.5 overflow-y-auto pr-1">
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
        </div>

        <SocialLinks className="mt-auto border-t border-[color:var(--app-border)] pt-4" iconClassName="h-10 w-10" />
      </aside>
    </div>,
    document.body,
  )
}
