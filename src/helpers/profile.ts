import { shortenAddress } from './walletUi'

export const PROFILE_MESSAGE_PREFIX = 'Combat Expert nickname update'
export const PROFILE_MAX_NICKNAME_LENGTH = 24

export function normalizeProfileNickname(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed.slice(0, PROFILE_MAX_NICKNAME_LENGTH)
}

export function buildProfileMessage({
  address,
  nickname,
  issuedAt,
}: {
  address: string
  nickname: string
  issuedAt: string
}) {
  return [
    PROFILE_MESSAGE_PREFIX,
    `Address: ${address.toLowerCase()}`,
    `Nickname: ${nickname || '(clear)'}`,
    `Issued At: ${issuedAt}`,
  ].join('\n')
}

export function getProfileDisplayName(address?: string, nickname?: string | null) {
  const normalizedNickname = normalizeProfileNickname(nickname || '')
  if (normalizedNickname) return normalizedNickname
  return shortenAddress(address, 6, 4)
}
