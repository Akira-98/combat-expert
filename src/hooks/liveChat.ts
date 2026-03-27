import * as Ably from 'ably'
import { formatCompactDateTime } from '../helpers/formatters'

const MESSAGE_LIMIT = 180
export const MESSAGE_MAX_LENGTH = 220

export type ChatMessage = {
  id: string
  text: string
  senderName: string
  timestamp: number
}

export type ConnectionUiState = 'connecting' | 'connected' | 'disconnected' | 'failed'

type InboundChatMessage = Pick<Ably.InboundMessage, 'id' | 'clientId' | 'timestamp' | 'data'>

function shortAddress(address?: string) {
  if (!address) return 'Guest'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function sanitizeSenderName(value: string | null | undefined) {
  if (!value) return 'Guest'
  const trimmed = value.trim()
  if (!trimmed) return 'Guest'
  return trimmed.slice(0, 24)
}

export function resolveConnectionState(state: string): ConnectionUiState {
  if (state === 'connected') return 'connected'
  if (state === 'failed' || state === 'suspended') return 'failed'
  if (state === 'disconnected' || state === 'closed') return 'disconnected'
  return 'connecting'
}

export function formatLiveChatMessageTime(timestamp: number) {
  return formatCompactDateTime(timestamp)
}

export function normalizeChatMessage(rawMessage: InboundChatMessage): ChatMessage | null {
  const data = rawMessage?.data
  if (!data || typeof data !== 'object') return null

  const textValue = typeof data.text === 'string' ? data.text.trim() : ''
  if (!textValue) return null

  const senderName = sanitizeSenderName(typeof data.name === 'string' ? data.name : shortAddress(rawMessage?.clientId))
  const timestampValue =
    typeof rawMessage?.timestamp === 'number'
      ? rawMessage.timestamp
      : typeof data.sentAt === 'number'
        ? data.sentAt
        : Date.now()
  const messageId =
    typeof rawMessage?.id === 'string' && rawMessage.id
      ? rawMessage.id
      : `${rawMessage?.clientId || 'guest'}-${timestampValue}-${textValue.slice(0, 20)}`

  return {
    id: messageId,
    text: textValue.slice(0, MESSAGE_MAX_LENGTH),
    senderName,
    timestamp: timestampValue,
  }
}

export function mergeChatMessages(previous: ChatMessage[], next: ChatMessage[]) {
  const byId = new Map<string, ChatMessage>()
  for (const item of previous) byId.set(item.id, item)
  for (const item of next) byId.set(item.id, item)
  return [...byId.values()]
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-MESSAGE_LIMIT)
}

export function isChatMessage(value: ChatMessage | null): value is ChatMessage {
  return Boolean(value)
}

export function isExpectedConnectionClosure(error: unknown) {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return message.includes('connection closed') || message.includes('connection unavailable')
}
