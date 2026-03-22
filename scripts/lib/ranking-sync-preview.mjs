function buildSelectedGames(games) {
  return games.map((game) => ({
    gameId: String(game?.gameId || ''),
    title: typeof game?.title === 'string' ? game.title : null,
    startsAt: typeof game?.startsAt === 'string' ? game.startsAt : null,
    leagueName: typeof game?.league?.name === 'string' ? game.league.name : null,
  }))
}

export function buildSourcePreview({ source, eventId, environment, days, gameIds, games, sourceMeta }) {
  return {
    source,
    eventId,
    environment,
    ...(source === 'settled-bets-mma'
      ? {
          days,
          recentSettledBetCount: sourceMeta.recentSettledBetCount,
          candidateGameCount: sourceMeta.candidateGameCount,
        }
      : {}),
    selectedGameCount: gameIds.length,
    selectedGames: buildSelectedGames(games),
  }
}
