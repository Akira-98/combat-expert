import type { WalletClient } from 'viem'
import { buildCommentAuthMessage } from '../helpers/comments'
import { translate } from '../i18n'

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

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
} as const

export async function fetchMarketComments(marketId: string): Promise<MarketComment[]> {
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

export async function postMarketComment({
  marketId,
  content,
}: {
  marketId: string
  content: string
}): Promise<MarketComment> {
  const response = await fetch('/api/comments', {
    method: 'POST',
    headers: JSON_HEADERS,
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

export async function fetchCommentSession(): Promise<CommentSessionPayload> {
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
  const nonceResponse = await fetch('/api/comment-auth/nonce', {
    method: 'POST',
    headers: JSON_HEADERS,
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
    headers: JSON_HEADERS,
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
