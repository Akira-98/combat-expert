import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWalletClient } from 'wagmi'
import { useAAWalletClient } from '../azuroSocialAaConnector'
import { buildProfileMessage, getProfileDisplayName, normalizeProfileNickname } from '../helpers/profile'

type UseProfileParams = {
  address?: `0x${string}`
  isConnected: boolean
  isAAWallet?: boolean
}

type ProfilePayload = {
  address: string
  nickname: string | null
}

async function fetchProfile(address: string): Promise<ProfilePayload> {
  const response = await fetch(`/api/profile?address=${encodeURIComponent(address.toLowerCase())}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(typeof payload?.error === 'string' ? payload.error : '프로필을 불러오지 못했습니다.')
  }

  return {
    address: typeof payload?.address === 'string' ? payload.address : address.toLowerCase(),
    nickname: typeof payload?.nickname === 'string' ? payload.nickname : null,
  }
}

async function saveProfile({
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
  const response = await fetch('/api/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      address,
      nickname,
      issuedAt,
      message,
      signature,
    }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(typeof payload?.error === 'string' ? payload.error : '프로필을 저장하지 못했습니다.')
  }

  return {
    address: typeof payload?.address === 'string' ? payload.address : address.toLowerCase(),
    nickname: typeof payload?.nickname === 'string' ? payload.nickname : null,
  }
}

export function useProfile({ address, isConnected, isAAWallet }: UseProfileParams) {
  const normalizedAddress = address?.toLowerCase() as `0x${string}` | undefined
  const queryClient = useQueryClient()
  const { data: walletClient } = useWalletClient()
  const aaWalletClient = useAAWalletClient()

  const profileQuery = useQuery({
    queryKey: ['profile', normalizedAddress],
    queryFn: () => fetchProfile(normalizedAddress as string),
    enabled: Boolean(normalizedAddress && isConnected),
    staleTime: 60_000,
  })

  const saveNicknameMutation = useMutation({
    mutationFn: async (nextNickname: string) => {
      const currentAddress = normalizedAddress
      if (!currentAddress) {
        throw new Error('연결된 지갑이 없습니다.')
      }

      const nickname = normalizeProfileNickname(nextNickname)
      const issuedAt = new Date().toISOString()
      const message = buildProfileMessage({
        address: currentAddress,
        nickname,
        issuedAt,
      })

      let signature = ''

      if (isAAWallet) {
        if (!aaWalletClient) {
          throw new Error('AA 지갑 클라이언트를 찾지 못했습니다.')
        }
        signature = await aaWalletClient.signMessage({
          message,
        })
      } else if (walletClient) {
        signature = await walletClient.signMessage({
          account: currentAddress,
          message,
        })
      } else {
        throw new Error('서명 가능한 지갑 클라이언트를 찾지 못했습니다.')
      }

      return saveProfile({
        address: currentAddress,
        nickname,
        issuedAt,
        message,
        signature,
      })
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile', normalizedAddress], profile)
    },
  })

  const nickname = profileQuery.data?.nickname ?? null
  const displayName = getProfileDisplayName(normalizedAddress, nickname)

  return {
    nickname,
    displayName,
    isLoading: profileQuery.isLoading,
    isSaving: saveNicknameMutation.isPending,
    errorMessage:
      (profileQuery.error instanceof Error ? profileQuery.error.message : undefined) ||
      (saveNicknameMutation.error instanceof Error ? saveNicknameMutation.error.message : undefined),
    saveNickname: (nextNickname: string) => saveNicknameMutation.mutateAsync(nextNickname),
    refetch: profileQuery.refetch,
  }
}
