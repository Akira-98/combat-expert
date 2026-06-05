import { translate } from '../i18n'

export const normalizeOutcomeLabel = (selectionName: string, participants: string[]) => {
  const value = selectionName.trim()
  if (participants.length >= 2) {
    const home = participants[0] ?? 'Home'
    const away = participants[1] ?? 'Away'

    if (value === '1') return home
    if (value === '2') return away
    if (/^(x|draw)$/i.test(value)) return translate('market.draw')
    if (/^1x$/i.test(value)) return `${home} / ${translate('market.draw')}`
    if (/^x2$/i.test(value)) return `${translate('market.draw')} / ${away}`
    if (value === '12') return `${home} / ${away}`

    const winnerMatch = value.match(/^w\s*([12])$/i)
    if (winnerMatch?.[1] === '1') return home
    if (winnerMatch?.[1] === '2') return away

    const teamMatch = value.match(/^team\s*([12])$/i)
    if (teamMatch?.[1] === '1') return home
    if (teamMatch?.[1] === '2') return away

    const prefixedPointMatch = value.match(/^([12])(\s*(?:\(.+\)|[+-]\d.*))$/)
    if (prefixedPointMatch?.[1] === '1') return `${home}${prefixedPointMatch[2]}`
    if (prefixedPointMatch?.[1] === '2') return `${away}${prefixedPointMatch[2]}`
  }
  return value
}
