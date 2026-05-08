import { getGameTimingMeta } from '../../helpers/gameTiming'
import { getGameParticipantNames } from '../../helpers/participants'
import { getSportIcon } from '../../helpers/sports'
import { ParticipantAvatar } from '../ParticipantAvatar'
import { GameOddsPreview } from './GameOddsPreview'
import type { GamesPaneProps } from './types'

type GameCardProps = {
  game: GamesPaneProps['games'][number]
  isActive: boolean
  selectedOutcomes: GamesPaneProps['selectedOutcomes']
  onSelectGame: GamesPaneProps['onSelectGame']
  onSelectOutcome: GamesPaneProps['onSelectOutcome']
  gameCardBaseClass: string
  gameCardIdleClass: string
}

export function GameCard({
  game,
  isActive,
  selectedOutcomes,
  onSelectGame,
  onSelectOutcome,
  gameCardBaseClass,
  gameCardIdleClass,
}: GameCardProps) {
  const timing = getGameTimingMeta(game.startsAt, game.state)
  const badgeClass =
    timing.tone === 'rose'
      ? 'ui-state-danger'
      : timing.tone === 'amber'
        ? 'ui-state-warning'
        : 'ui-pill'

  return (
    <div className="py-1 first:pt-0 last:pb-0">
      <div
        aria-pressed={isActive}
        className={`${gameCardBaseClass} ${gameCardIdleClass}`}
        onClick={() => onSelectGame(game.gameId)}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          onSelectGame(game.gameId)
        }}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex shrink-0 -space-x-2">
              {game.participants.slice(0, 2).map((participant) => (
                <ParticipantAvatar key={`${game.gameId}-${participant.name}`} participant={participant} />
              ))}
            </div>
            <div className="min-w-0">
              <span className="ui-text-strong block font-semibold">{game.title}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-1.5 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs">
            <span className="ui-pill chip-shell inline-flex items-center gap-1.5 px-2 py-1 font-semibold">
              <span aria-hidden="true" className="text-sm leading-none">{getSportIcon(game.sportName)}</span>
              {game.sportName}
            </span>
            <span className="ui-pill chip-shell px-2 py-1 font-medium">{game.leagueName}</span>
            <span className={`chip-shell px-2 py-1 font-semibold ${badgeClass}`}>{timing.label}</span>
            <span className="ui-text-muted">{timing.detail}</span>
          </div>
          <GameOddsPreview
            gameId={game.gameId}
            participants={getGameParticipantNames(game)}
            priority={isActive}
            selectedOutcomes={selectedOutcomes}
            onSelectOutcome={onSelectOutcome}
            className="min-w-0 text-left md:max-w-[18rem] md:justify-end md:text-right"
          />
        </div>
      </div>
    </div>
  )
}
