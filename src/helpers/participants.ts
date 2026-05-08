import type { GameItem, GameParticipantItem } from '../types/ui'

export const getParticipantNames = (participants: GameParticipantItem[]) =>
  participants.map((participant) => participant.name)

export const getGameParticipantNames = (game: GameItem) => getParticipantNames(game.participants)
