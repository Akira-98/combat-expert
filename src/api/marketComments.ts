import type { WalletClient } from 'viem'
import { buildCommentAuthMessage } from '../helpers/comments'
import { translate } from '../i18n'
import { getJson, postJson } from './http'

export type MarketComment = {
  id: string
  marketId: string
  address: string
  nickname: string | null
  content: string
  createdAt: string
}

export type CommentSessionPayload = {
  authenticated: boolean
  address?: string
}

export type SignableAAWalletClient = {
  signMessage(args: { message: string }): Promise<string>
}

export async function fetchMarketComments(marketId: string): Promise<MarketComment[]> {
  const payload = await getJson(
    `/api/comments?marketId=${encodeURIComponent(marketId)}`,
    translate('marketComments.fetchFailed'),
  )
  const commentsPayload = payload && typeof payload === 'object' ? payload as { comments?: unknown } : {}

  return Array.isArray(commentsPayload.comments) ? commentsPayload.comments as MarketComment[] : []
}

export async function postMarketComment({
  marketId,
  content,
}: {
  marketId: string
  content: string
}): Promise<MarketComment> {
  const payload = await postJson(
    '/api/comments',
    {
      marketId,
      content,
    },
    translate('marketComments.saveFailed'),
  )
  const commentPayload = payload && typeof payload === 'object' ? payload as { comment?: unknown } : {}

  return commentPayload.comment as MarketComment
}

export async function fetchCommentSession(): Promise<CommentSessionPayload> {
  const payload = await getJson('/api/comment-auth/session', translate('marketComments.sessionFailed'))
  const sessionPayload = payload && typeof payload === 'object' ? payload as Partial<CommentSessionPayload> : {}

  return {
    authenticated: Boolean(sessionPayload.authenticated),
    address: typeof sessionPayload.address === 'string' ? sessionPayload.address : undefined,
  }
}

export async function createCommentSession({
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
  const noncePayload = await postJson('/api/comment-auth/nonce', { address }, translate('marketComments.startLoginFailed'))
  const nonceRecord = noncePayload && typeof noncePayload === 'object' ? noncePayload as Record<string, unknown> : {}

  const nonce = typeof nonceRecord.nonce === 'string' ? nonceRecord.nonce : ''
  const issuedAt = typeof nonceRecord.issuedAt === 'string' ? nonceRecord.issuedAt : ''
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

  await postJson(
    '/api/comment-auth/verify',
    {
      address,
      issuedAt,
      message,
      signature,
    },
    translate('marketComments.verifyLoginFailed'),
  )
}
