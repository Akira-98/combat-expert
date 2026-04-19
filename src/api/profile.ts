import { translate } from '../i18n'
import { getJson, postJson } from './http'

export type ProfilePayload = {
  address: string
  nickname: string | null
}

export async function fetchProfile(address: string): Promise<ProfilePayload> {
  const payload = await getJson(
    `/api/profile?address=${encodeURIComponent(address.toLowerCase())}`,
    translate('profile.loadFailed'),
  )
  const profile = payload && typeof payload === 'object' ? payload as Partial<ProfilePayload> : {}

  return {
    address: typeof profile.address === 'string' ? profile.address : address.toLowerCase(),
    nickname: typeof profile.nickname === 'string' ? profile.nickname : null,
  }
}

export async function saveProfile({
  address,
  nickname,
  issuedAt,
  message,
  signature,
}: {
  address: string
  nickname: string
  issuedAt: string
  message: string
  signature: string
}): Promise<ProfilePayload> {
  const payload = await postJson(
    '/api/profile',
    {
      address,
      nickname,
      issuedAt,
      message,
      signature,
    },
    translate('profile.saveFailed'),
  )
  const profile = payload && typeof payload === 'object' ? payload as Partial<ProfilePayload> : {}

  return {
    address: typeof profile.address === 'string' ? profile.address : address.toLowerCase(),
    nickname: typeof profile.nickname === 'string' ? profile.nickname : null,
  }
}
