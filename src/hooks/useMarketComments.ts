import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWalletClient } from 'wagmi'
import { useAAWalletClient } from '../azuroSocialAaConnector'
import { buildCommentMessage, getCommentAuthorLabel, normalizeCommentContent } from '../helpers/comments'

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
    throw new Error(typeof payload?.error === 'string' ? payload.error : '댓글을 불러오지 못했습니다.')
  }

  return Array.isArray(payload?.comments) ? payload.comments : []
}

async function postComment({
  marketId,
  address,
  content,
  issuedAt,
  message,
  signature,
}: {
  marketId: string
  address: string
  content: string
  issuedAt: string
  message: string
  signature: string
}): Promise<MarketComment> {
  const response = await fetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      marketId,
      address,
      content,
      issuedAt,
      message,
      signature,
    }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(typeof payload?.error === 'string' ? payload.error : '댓글을 저장하지 못했습니다.')
  }

  return payload.comment as MarketComment
}

export function useMarketComments({ marketId, address, isConnected, isAAWallet }: UseMarketCommentsParams) {
  const normalizedAddress = address?.toLowerCase() as `0x${string}` | undefined
  const queryClient = useQueryClient()
  const { data: walletClient } = useWalletClient()
  const aaWalletClient = useAAWalletClient()

  const commentsQuery = useQuery({
    queryKey: ['market-comments', marketId],
    queryFn: () => fetchComments(marketId as string),
    enabled: Boolean(marketId),
    staleTime: 15_000,
  })

  const createCommentMutation = useMutation({
    mutationFn: async (draft: string) => {
      if (!marketId) throw new Error('마켓을 선택해 주세요.')
      if (!normalizedAddress || !isConnected) throw new Error('지갑 연결이 필요합니다.')

      const content = normalizeCommentContent(draft)
      if (!content) throw new Error('댓글 내용을 입력해 주세요.')

      const issuedAt = new Date().toISOString()
      const message = buildCommentMessage({
        marketId,
        address: normalizedAddress,
        content,
        issuedAt,
      })

      let signature = ''

      if (isAAWallet) {
        if (!aaWalletClient) throw new Error('AA 지갑 클라이언트를 찾지 못했습니다.')
        signature = await aaWalletClient.signMessage({ message })
      } else if (walletClient) {
        signature = await walletClient.signMessage({
          account: normalizedAddress,
          message,
        })
      } else {
        throw new Error('서명 가능한 지갑 클라이언트를 찾지 못했습니다.')
      }

      return postComment({
        marketId,
        address: normalizedAddress,
        content,
        issuedAt,
        message,
        signature,
      })
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
    isSubmitting: createCommentMutation.isPending,
    errorMessage:
      (commentsQuery.error instanceof Error ? commentsQuery.error.message : undefined) ||
      (createCommentMutation.error instanceof Error ? createCommentMutation.error.message : undefined),
    createComment: (draft: string) => createCommentMutation.mutateAsync(draft),
    refetch: commentsQuery.refetch,
    getAuthorLabel: (comment: Pick<MarketComment, 'address' | 'nickname'>) =>
      getCommentAuthorLabel(comment.address, comment.nickname),
  }
}
