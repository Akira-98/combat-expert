import { translate } from '../../i18n'

export const normalizeOutcomeLabel = (selectionName: string, participants: string[]) => {
  const value = selectionName.trim()
  if (participants.length >= 2) {
    if (value === '1') return participants[0] ?? 'Home'
    if (value === '2') return participants[1] ?? 'Away'
    if (/^(x|draw)$/i.test(value)) return translate('market.draw')
  }
  return value
}

export const truncateLabel = (label: string, max = 14) => (label.length > max ? `${label.slice(0, max - 1)}…` : label)

export const outcomePreviewPriority = (selectionName: string) => {
  const raw = selectionName.trim().toLowerCase()
  if (raw === '1') return 0
  if (raw === 'x' || raw === 'draw') return 1
  if (raw === '2') return 2
  return 10
}
