import { getParticipantNames } from './marketOgImage.js'

export const PICKS_OG_COLORS = {
  bg: '#030306',
  surface: '#0c0b12',
  surfaceSoft: '#14121d',
  border: '#292230',
  textStrong: '#ffffff',
  textBody: '#e5e7eb',
  textMuted: '#9ca3af',
  accent: '#d35aab',
  accentDark: '#24111f',
}

export function shortenWallet(wallet) {
  const value = String(wallet || '').trim()
  return value.length >= 12 ? `${value.slice(0, 6)}...${value.slice(-4)}` : ''
}

export function normalizeNameKey(name) {
  return String(name || '').trim().replace(/\s+/g, ' ').toLowerCase()
}

export function formatOdds(odds) {
  const value = Number(odds)
  return Number.isFinite(value) && value > 0 ? value.toFixed(2) : '-'
}

export function calculateTotalOdds(selections) {
  const odds = selections.map((selection) => Number(selection?.odds)).filter((value) => Number.isFinite(value) && value > 0)
  if (odds.length !== selections.length || odds.length === 0) return undefined

  return odds.reduce((total, value) => total * value, 1)
}

export function getSelectionLabel(selection) {
  return selection?.label || selection?.selectionName || 'Pick'
}

export function getGameId(value) {
  return value?.gameId || value?.id || ''
}

export function getGameForSelection(selection, gameById) {
  const gameId = selection?.gameId
  return gameId ? gameById?.get(gameId) : undefined
}

export function getGameTitle(selection, game) {
  if (selection?.gameTitle) return selection.gameTitle

  const participantTitle = getParticipantNames(game).join(' vs ')
  return participantTitle || 'Sports Market'
}

export function getShortGameTitle(selection, game) {
  return getGameTitle(selection, game)
    .replace(/\bJack Della Maddalena\b/g, 'JDM')
    .replace(/\bCarlos Prates\b/g, 'Prates')
}

export function getInitials(name) {
  const tokens = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return '?'
  return tokens.slice(0, 2).map((token) => token[0]?.toUpperCase() || '').join('')
}
