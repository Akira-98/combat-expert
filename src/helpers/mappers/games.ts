import type { GameItem } from '../../types/ui'

type GameLike = {
  gameId: string
  title: string
  startsAt: string
  state?: string
  league: { name: string }
  participants: Array<{ name: string }>
}

export const mapGamesToItems = (games: GameLike[]): GameItem[] =>
  games.map((game) => ({
    gameId: game.gameId,
    title: game.title,
    startsAt: game.startsAt,
    state: game.state,
    leagueName: game.league.name,
    participants: game.participants.map((participant) => participant.name),
  }))
