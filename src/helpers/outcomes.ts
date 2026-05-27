import { translate } from '../i18n'

export const normalizeOutcomeLabel = (selectionName: string, participants: string[]) => {
  const value = selectionName.trim()
  if (participants.length >= 2) {
    if (value === '1') return participants[0] ?? 'Home'
    if (value === '2') return participants[1] ?? 'Away'
    if (/^(x|draw)$/i.test(value)) return translate('market.draw')
  }
  return value
}
