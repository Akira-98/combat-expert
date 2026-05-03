export const PROFILE_MESSAGE_PREFIX: string
export const PROFILE_MAX_NICKNAME_LENGTH: number
export const PROFILE_MESSAGE_TTL_MS: number

export function normalizeProfileNickname(value: string | null | undefined): string

export function buildProfileMessage(params: {
  address: string
  nickname: string | null | undefined
  issuedAt: string
}): string
