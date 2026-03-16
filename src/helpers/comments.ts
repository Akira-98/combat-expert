import { shortenAddress } from './walletUi'

export { buildCommentMessage, normalizeCommentContent, COMMENT_MAX_LENGTH } from '../../shared/signingPayloads.js'

export function getCommentAuthorLabel(address?: string, nickname?: string | null) {
  const trimmedNickname = (nickname || '').trim()
  if (trimmedNickname) return trimmedNickname
  return shortenAddress(address, 6, 4)
}

export function formatCommentTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}
