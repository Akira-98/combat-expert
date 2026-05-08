import type { GameItem } from '../../types/ui'

type GameLike = {
  gameId: string
  title: string
  startsAt: string
  state?: string
  turnover?: string
  sport?: { name?: string; slug?: string; sportId?: string; sporthub?: { slug?: string } }
  league: { name: string; slug?: string }
  country?: { name?: string; slug?: string }
  participants: Array<{ image?: string | null; name: string }>
}

function getSportHub(game: GameLike): 'sports' | 'esports' {
  if (game.sport?.sporthub?.slug === 'esports') return 'esports'

  const value = `${game.sport?.name ?? ''} ${game.sport?.slug ?? ''} ${game.title}`.toLowerCase()
  return /\besports?\b|\be-?sports?\b|\bcyber\b/.test(value) ? 'esports' : 'sports'
}

export const mapGamesToItems = (games: GameLike[]): GameItem[] =>
  games.map((game) => ({
    gameId: game.gameId,
    title: game.title,
    startsAt: game.startsAt,
    state: game.state,
    turnover: game.turnover,
    sportName: game.sport?.name || game.sport?.slug || game.sport?.sportId || 'Sports',
    sportSlug: game.sport?.slug || game.sport?.sportId || 'sports',
    sportHub: getSportHub(game),
    leagueName: game.league.name,
    leagueSlug: game.league.slug,
    countryName: game.country?.name,
    countrySlug: game.country?.slug,
    participants: game.participants.map((participant) => ({
      name: participant.name,
      image: participant.image,
    })),
  }))
