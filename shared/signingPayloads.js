export const PROFILE_MESSAGE_PREFIX = 'Combat Expert nickname update'
export const PROFILE_MAX_NICKNAME_LENGTH = 24
export const PROFILE_MESSAGE_TTL_MS = 5 * 60 * 1000

export const COMMENT_MESSAGE_PREFIX = 'Combat Expert market comment'
export const COMMENT_MAX_LENGTH = 500
export const COMMENT_MESSAGE_TTL_MS = 5 * 60 * 1000

export function normalizeProfileNickname(value) {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''
  return trimmed.slice(0, PROFILE_MAX_NICKNAME_LENGTH)
}

export function normalizeCommentContent(value) {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''
  return trimmed.slice(0, COMMENT_MAX_LENGTH)
}

export function buildProfileMessage({ address, nickname, issuedAt }) {
  return [
    PROFILE_MESSAGE_PREFIX,
    `Address: ${address.toLowerCase()}`,
    `Nickname: ${normalizeProfileNickname(nickname) || '(clear)'}`,
    `Issued At: ${issuedAt}`,
  ].join('\n')
}

export function buildCommentMessage({ marketId, address, content, issuedAt }) {
  return [
    COMMENT_MESSAGE_PREFIX,
    `Market: ${marketId}`,
    `Address: ${address.toLowerCase()}`,
    `Content: ${normalizeCommentContent(content)}`,
    `Issued At: ${issuedAt}`,
  ].join('\n')
}
