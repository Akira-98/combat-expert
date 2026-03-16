import { shortenAddress } from './walletUi'
import { normalizeProfileNickname } from '../../shared/signingPayloads.js'

export { buildProfileMessage, normalizeProfileNickname, PROFILE_MAX_NICKNAME_LENGTH } from '../../shared/signingPayloads.js'

export function getProfileDisplayName(address?: string, nickname?: string | null) {
  const normalizedNickname = normalizeProfileNickname(nickname || '')
  if (normalizedNickname) return normalizedNickname
  return shortenAddress(address, 6, 4)
}
