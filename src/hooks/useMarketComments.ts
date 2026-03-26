import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { WalletClient } from 'viem'
import { useWalletClient } from 'wagmi'
import { useAAWalletClient } from '../azuroSocialAaConnector'
import { buildCommentAuthMessage, getCommentAuthorLabel, normalizeCommentContent } from '../helpers/comments'
import { translate } from '../i18n'

type UseMarketCommentsParams = {
  marketId?: string
  address?: `0x${string}`
  isConnected: boolean
  isAAWallet?: boolean
}

export type MarketComment = {
  id: string
  marketId: string
  address: string
  nickname: string | null
  content: string
  createdAt: string
}

async function fetchComments(marketId: string): Promise<MarketComment[]> {
  const response = await fetch(`/api/comments?marketId=${encodeURIComponent(marketId)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(typeof payload?.error === 'string' ? payload.error : translate('marketComments.fetchFailed'))
  }

  return Array.isArray(payload?.comments) ? payload.comments : []
}

async function postComment({
  marketId,
  content,
}: {
  marketId: string
  content: string
}): Promise<MarketComment> {
  const response = await fetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      marketId,
      content,
    }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(typeof payload?.error === 'string' ? payload.error : translate('marketComments.saveFailed'))
  }

  return payload.comment as MarketComment
}

type CommentSessionPayload = {
  authenticated: boolean
  address?: string
}

type SignableAAWalletClient = {
  signMessage(args: { message: string }): Promise<string>
}

async function fetchCommentSession(): Promise<CommentSessionPayload> {
  const response = await fetch('/api/comment-auth/session', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(typeof payload?.error === 'string' ? payload.error : translate('marketComments.sessionFailed'))
  }

  return {
    authenticated: Boolean(payload?.authenticated),
    address: typeof payload?.address === 'string' ? payload.address : undefined,
  }
}

async function createCommentSession({
  address,
  isAAWallet,
  walletClient,
  aaWalletClient,
}: {
  address: `0x${string}`
  isAAWallet?: boolean
  walletClient?: WalletClient
  aaWalletClient?: SignableAAWalletClient | null
}) {
  const nonceResponse = await fetch('/api/comment-auth/nonce', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ address }),
  })

  const noncePayload = await nonceResponse.json().catch(() => ({}))
  if (!nonceResponse.ok) {
    throw new Error(typeof noncePayload?.error === 'string' ? noncePayload.error : translate('marketComments.startLoginFailed'))
  }

  const nonce = typeof noncePayload?.nonce === 'string' ? noncePayload.nonce : ''
  const issuedAt = typeof noncePayload?.issuedAt === 'string' ? noncePayload.issuedAt : ''
  if (!nonce || !issuedAt) {
    throw new Error(translate('marketComments.invalidLoginRequest'))
  }

  const message = buildCommentAuthMessage({
    address,
    nonce,
    issuedAt,
  })

  let signature = ''

  if (isAAWallet) {
    if (!aaWalletClient) throw new Error(translate('profile.noAaWalletClient'))
    signature = await aaWalletClient.signMessage({ message })
  } else if (walletClient) {
    signature = await walletClient.signMessage({
      account: address,
      message,
    })
  } else {
    throw new Error(translate('profile.noSignWalletClient'))
  }

  const verifyResponse = await fetch('/api/comment-auth/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      address,
      issuedAt,
      message,
      signature,
    }),
  })

  const verifyPayload = await verifyResponse.json().catch(() => ({}))
  if (!verifyResponse.ok) {
    throw new Error(typeof verifyPayload?.error === 'string' ? verifyPayload.error : translate('marketComments.verifyLoginFailed'))
  }
}

export function useMarketComments({ marketId, address, isConnected, isAAWallet }: UseMarketCommentsParams) {
  const normalizedAddress = address?.toLowerCase() as `0x${string}` | undefined
  const queryClient = useQueryClient()
  const { data: walletClient } = useWalletClient()
  const aaWalletClient = useAAWalletClient()
  const sessionQuery = useQuery({
    queryKey: ['comment-session'],
    queryFn: fetchCommentSession,
    staleTime: 60_000,
  })

  const commentsQuery = useQuery({
    queryKey: ['market-comments', marketId],
    queryFn: () => fetchComments(marketId as string),
    enabled: Boolean(marketId),
    staleTime: 15_000,
  })

  const createCommentMutation = useMutation({
    mutationFn: async (draft: string) => {
      if (!marketId) throw new Error(translate('marketComments.selectMarket'))

      const content = normalizeCommentContent(draft)
      if (!content) throw new Error(translate('marketComments.enterContent'))

      const currentSession = sessionQuery.data
      const hasMatchingSession =
        currentSession?.authenticated &&
        (!normalizedAddress || currentSession.address?.toLowerCase() === normalizedAddress)

      if (!hasMatchingSession) {
        if (!normalizedAddress || !isConnected) throw new Error(translate('marketComments.connectForLogin'))

        await createCommentSession({
          address: normalizedAddress,
          isAAWallet,
          walletClient,
          aaWalletClient,
        })

        await queryClient.invalidateQueries({ queryKey: ['comment-session'] })
      }

      const attemptPost = async () => postComment({ marketId, content })

      try {
        return await attemptPost()
      } catch (error) {
        if (!(error instanceof Error) || !/session/i.test(error.message)) throw error
        if (!normalizedAddress || !isConnected) throw error

        await createCommentSession({
          address: normalizedAddress,
          isAAWallet,
          walletClient,
          aaWalletClient,
        })

        await queryClient.invalidateQueries({ queryKey: ['comment-session'] })
        return attemptPost()
      }
    },
    onSuccess: (comment) => {
      queryClient.setQueryData(['market-comments', marketId], (current: MarketComment[] | undefined) => {
        const next = [comment, ...(current || [])]
        return next.filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index)
      })
    },
  })

  return {
    comments: commentsQuery.data || [],
    isLoading: commentsQuery.isLoading,
    isSessionLoading: sessionQuery.isLoading,
    isAuthenticated: Boolean(sessionQuery.data?.authenticated),
    sessionAddress: sessionQuery.data?.address,
    isSubmitting: createCommentMutation.isPending,
    errorMessage:
      (sessionQuery.error instanceof Error ? sessionQuery.error.message : undefined) ||
      (commentsQuery.error instanceof Error ? commentsQuery.error.message : undefined) ||
      (createCommentMutation.error instanceof Error ? createCommentMutation.error.message : undefined),
    createComment: (draft: string) => createCommentMutation.mutateAsync(draft),
    refetch: commentsQuery.refetch,
    getAuthorLabel: (comment: Pick<MarketComment, 'address' | 'nickname'>) =>
      getCommentAuthorLabel(comment.address, comment.nickname),
  }
}
