import { formatGameStartTime } from './formatters'
import { translate } from '../i18n'
import { parseGameStartTimeMs } from './parseGameStartTime'

export type GameStatusFilter = 'all' | 'live' | 'upcoming'
export type SubgraphGameState = 'Prematch' | 'Live' | 'Finished' | 'Stopped'

type GameTimingTone = 'rose' | 'amber' | 'slate'

const LIVE_WINDOW_BEFORE_MS = 5 * 60 * 1000
const LIVE_WINDOW_AFTER_MS = 3 * 60 * 60 * 1000

function getGamePhaseFromSubgraphState(gameState?: string) {
  switch (gameState as SubgraphGameState | undefined) {
    case 'Live':
    case 'Stopped':
      return 'live' as const
    case 'Prematch':
      return 'upcoming' as const
    case 'Finished':
      return 'ended' as const
    default:
      return undefined
  }
}

export function getGamePhase(startsAt: string, gameState?: string, now = Date.now()) {
  const phaseFromSubgraph = getGamePhaseFromSubgraphState(gameState)
  if (phaseFromSubgraph) return phaseFromSubgraph

  const startTime = parseGameStartTimeMs(startsAt)
  const liveStart = startTime - LIVE_WINDOW_BEFORE_MS
  const liveEnd = startTime + LIVE_WINDOW_AFTER_MS

  if (now >= liveStart && now <= liveEnd) return 'live' as const
  if (now < liveStart) return 'upcoming' as const
  return 'ended' as const
}

export function matchesGameStatusFilter(startsAt: string, statusFilter: GameStatusFilter, gameState?: string, now = Date.now()) {
  const phase = getGamePhase(startsAt, gameState, now)
  if (statusFilter === 'all') return phase !== 'ended'
  return phase === statusFilter
}

export function getGameTimingMeta(startsAt: string, gameState?: string, now = Date.now()): {
  label: string
  tone: GameTimingTone
  detail: string
} {
  const startTime = parseGameStartTimeMs(startsAt)
  const diffMs = startTime - now
  const phase = getGamePhase(startsAt, gameState, now)

  if (gameState === 'Stopped') {
    return {
      label: translate('gameStatus.stopped'),
      tone: 'slate',
      detail: translate('gameStatus.startsAt', { time: formatGameStartTime(startsAt) }),
    }
  }

  if (phase === 'live') {
    return {
      label: 'LIVE',
      tone: 'rose',
      detail: translate('gameStatus.startsAt', { time: formatGameStartTime(startsAt) }),
    }
  }

  if (phase === 'upcoming') {
    const minutes = Math.floor(diffMs / (60 * 1000))
    if (minutes < 60) {
      return {
        label: translate('gameStatus.upcoming'),
        tone: 'amber',
        detail: translate('gameStatus.inMinutes', { count: minutes }),
      }
    }
    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
      return {
        label: translate('gameStatus.upcoming'),
        tone: 'amber',
        detail: translate('gameStatus.inHours', { count: hours }),
      }
    }
    return {
      label: translate('gameStatus.upcoming'),
      tone: 'slate',
      detail: formatGameStartTime(startsAt),
    }
  }

  return {
    label: gameState === 'Finished' ? translate('gameStatus.finished') : translate('gameStatus.estimatedFinished'),
    tone: 'slate',
    detail: formatGameStartTime(startsAt),
  }
}
