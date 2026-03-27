import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWalletClient } from 'wagmi'
import { useAAWalletClient } from '../azuroSocialAaConnector'
import {
  createCommentSession,
  fetchCommentSession,
  fetchMarketComments,
  postMarketComment,
  type MarketComment,
  type SignableAAWalletClient,
} from '../api/marketComments'
import { getCommentAuthorLabel, normalizeCommentContent } from '../helpers/comments'
import { translate } from '../i18n'
import type { WalletClient } from 'viem'

type UseMarketCommentsParams = {
  marketId?: string
  address?: `0x${string}`
  isConnected: boolean
  isAAWallet?: boolean
}

const COMMENT_SESSION_QUERY_KEY = ['comment-session'] as const
const marketCommentsQueryKey = (marketId?: string) => ['market-comments', marketId] as const

type EnsureAuthenticatedSessionParams = {
  normalizedAddress?: `0x${string}`
  isConnected: boolean
  isAAWallet?: boolean
  walletClient?: WalletClient
  aaWalletClient?: SignableAAWalletClient | null
  sessionAuthenticated?: boolean
  sessionAddress?: string
  queryClient: ReturnType<typeof useQueryClient>
}

async function ensureAuthenticatedSession({
  normalizedAddress,
  isConnected,
  isAAWallet,
  walletClient,
  aaWalletClient,
  sessionAuthenticated,
  sessionAddress,
  queryClient,
}: EnsureAuthenticatedSessionParams) {
  const hasMatchingSession =
    sessionAuthenticated && (!normalizedAddress || sessionAddress?.toLowerCase() === normalizedAddress)

  if (hasMatchingSession) return
  if (!normalizedAddress || !isConnected) throw new Error(translate('marketComments.connectForLogin'))

  await createCommentSession({
    address: normalizedAddress,
    isAAWallet,
    walletClient,
    aaWalletClient,
  })

  await queryClient.invalidateQueries({ queryKey: COMMENT_SESSION_QUERY_KEY })
}

async function submitCommentWithRetry({
  marketId,
  content,
  normalizedAddress,
  isConnected,
  isAAWallet,
  walletClient,
  aaWalletClient,
  queryClient,
}: {
  marketId: string
  content: string
  normalizedAddress?: `0x${string}`
  isConnected: boolean
  isAAWallet?: boolean
  walletClient?: WalletClient
  aaWalletClient?: SignableAAWalletClient | null
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const attemptPost = () => postMarketComment({ marketId, content })

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

    await queryClient.invalidateQueries({ queryKey: COMMENT_SESSION_QUERY_KEY })
    return attemptPost()
  }
}

export function useMarketComments({ marketId, address, isConnected, isAAWallet }: UseMarketCommentsParams) {
  const normalizedAddress = address?.toLowerCase() as `0x${string}` | undefined
  const queryClient = useQueryClient()
  const { data: walletClient } = useWalletClient()
  const aaWalletClient = useAAWalletClient()
  const sessionQuery = useQuery({
    queryKey: COMMENT_SESSION_QUERY_KEY,
    queryFn: fetchCommentSession,
    staleTime: 60_000,
  })

  const commentsQuery = useQuery({
    queryKey: marketCommentsQueryKey(marketId),
    queryFn: () => fetchMarketComments(marketId as string),
    enabled: Boolean(marketId),
    staleTime: 15_000,
  })

  const createCommentMutation = useMutation({
    mutationFn: async (draft: string) => {
      if (!marketId) throw new Error(translate('marketComments.selectMarket'))

      const content = normalizeCommentContent(draft)
      if (!content) throw new Error(translate('marketComments.enterContent'))

      await ensureAuthenticatedSession({
        normalizedAddress,
        isConnected,
        isAAWallet,
        walletClient,
        aaWalletClient,
        sessionAuthenticated: sessionQuery.data?.authenticated,
        sessionAddress: sessionQuery.data?.address,
        queryClient,
      })

      return submitCommentWithRetry({
        marketId,
        content,
        normalizedAddress,
        isConnected,
        isAAWallet,
        walletClient,
        aaWalletClient,
        queryClient,
      })
    },
    onSuccess: (comment) => {
      queryClient.setQueryData(marketCommentsQueryKey(marketId), (current: MarketComment[] | undefined) => {
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
