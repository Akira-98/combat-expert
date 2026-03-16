export const PROFILE_MESSAGE_PREFIX: string
export const PROFILE_MAX_NICKNAME_LENGTH: number
export const PROFILE_MESSAGE_TTL_MS: number

export const COMMENT_MESSAGE_PREFIX: string
export const COMMENT_MAX_LENGTH: number
export const COMMENT_MESSAGE_TTL_MS: number

export function normalizeProfileNickname(value: string | null | undefined): string
export function normalizeCommentContent(value: string | null | undefined): string

export function buildProfileMessage(params: {
  address: string
  nickname: string | null | undefined
  issuedAt: string
}): string

export function buildCommentMessage(params: {
  marketId: string
  address: string
  content: string | null | undefined
  issuedAt: string
}): string
