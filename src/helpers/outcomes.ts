import { translate } from '../i18n'

export const normalizeParticipantTokenLabel = (label: string, participants: string[]) => {
  const [home, away] = participants

  if (!home && !away) return label

  return label.replace(/\bteam\s*([12])\b/gi, (match, teamNumber: string) => {
    if (teamNumber === '1') return home || match
    if (teamNumber === '2') return away || match
    return match
  })
}

export const normalizeOutcomeLabel = (selectionName: string, participants: string[]) => {
  const value = normalizeParticipantTokenLabel(selectionName.trim(), participants)
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
