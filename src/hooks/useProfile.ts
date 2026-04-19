import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWalletClient } from 'wagmi'
import { useAAWalletClient } from '../azuroSocialAaConnector'
import { fetchProfile, saveProfile } from '../api/profile'
import { buildProfileMessage, getProfileDisplayName, normalizeProfileNickname } from '../helpers/profile'
import { translate } from '../i18n'

type UseProfileParams = {
  address?: `0x${string}`
  isConnected: boolean
  isAAWallet?: boolean
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
        throw new Error(translate('profile.noWallet'))
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
          throw new Error(translate('profile.noAaWalletClient'))
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
        throw new Error(translate('profile.noSignWalletClient'))
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
