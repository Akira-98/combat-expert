import { shortenAddress } from './walletUi'
import { formatCompactDateTime } from './formatters'

export { buildCommentMessage, buildCommentAuthMessage, normalizeCommentContent, COMMENT_MAX_LENGTH } from '../../shared/signingPayloads.js'

export function getCommentAuthorLabel(address?: string, nickname?: string | null) {
  const trimmedNickname = (nickname || '').trim()
  if (trimmedNickname) return trimmedNickname
  return shortenAddress(address, 6, 4)
}

export function formatCommentTime(value: string) {
  return formatCompactDateTime(value)
}
