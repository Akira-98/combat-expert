export function getSportIcon(name: string) {
  const normalized = name.trim().toLowerCase().replace(/[_-]+/g, ' ')

  if (!normalized) return '🏆'
  if (/\b(mma|mixed martial arts|boxing|kickboxing|muay thai|ufc|combat)\b/.test(normalized)) return '🥊'
  if (/\b(american football|gridiron|nfl|ncaa football)\b/.test(normalized)) return '🏈'
  if (/\b(football|soccer|futsal)\b/.test(normalized)) return '⚽️'
  if (/\b(table tennis|ping pong|pingpong)\b/.test(normalized)) return '🏓'
  if (/\b(tennis)\b/.test(normalized)) return '🎾'
  if (/\b(baseball|mlb)\b/.test(normalized)) return '⚾️'
  if (/\b(basketball|nba)\b/.test(normalized)) return '🏀'
  if (/\b(ice hockey|hockey|nhl)\b/.test(normalized)) return '🏒'
  if (/\b(volleyball)\b/.test(normalized)) return '🏐'
  if (/\b(cricket)\b/.test(normalized)) return '🏏'
  if (/\b(rugby)\b/.test(normalized)) return '🏉'
  if (/\b(golf)\b/.test(normalized)) return '⛳️'
  if (/\b(esports?|e sports|cyber)\b/.test(normalized)) return '🎮'

  return '🏆'
}
