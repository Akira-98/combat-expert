import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import * as Ably from 'ably'
import type { Address } from 'viem'
import { useAppConfig } from '../config/useAppConfig'
import { getProfileDisplayName } from '../helpers/profile'

const CHAT_CLIENT_ID_KEY = 'ufc-live-chat-client-id'
const MESSAGE_LIMIT = 180
const MESSAGE_MAX_LENGTH = 220

export type ChatMessage = {
  id: string
  text: string
  senderName: string
  timestamp: number
}

type ConnectionUiState = 'connecting' | 'connected' | 'disconnected' | 'failed'

type UseLiveChatParams = {
  address?: Address
  nickname?: string | null
}

function shortAddress(address?: string) {
  if (!address) return 'Guest'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function sanitizeSenderName(value: string | null | undefined) {
  if (!value) return 'Guest'
  const trimmed = value.trim()
  if (!trimmed) return 'Guest'
  return trimmed.slice(0, 24)
}

function resolveConnectionState(state: string): ConnectionUiState {
  if (state === 'connected') return 'connected'
  if (state === 'failed' || state === 'suspended') return 'failed'
  if (state === 'disconnected' || state === 'closed') return 'disconnected'
  return 'connecting'
}

export function formatLiveChatMessageTime(timestamp: number) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(timestamp)
}

type InboundChatMessage = Pick<Ably.InboundMessage, 'id' | 'clientId' | 'timestamp' | 'data'>

function normalizeMessage(rawMessage: InboundChatMessage): ChatMessage | null {
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

function mergeMessages(previous: ChatMessage[], next: ChatMessage[]) {
  const byId = new Map<string, ChatMessage>()
  for (const item of previous) byId.set(item.id, item)
  for (const item of next) byId.set(item.id, item)
  return [...byId.values()]
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-MESSAGE_LIMIT)
}

function isChatMessage(value: ChatMessage | null): value is ChatMessage {
  return Boolean(value)
}

function isExpectedConnectionClosure(error: unknown) {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return message.includes('connection closed') || message.includes('connection unavailable')
}

export function useLiveChat({ address, nickname }: UseLiveChatParams) {
  const { ablyChannel } = useAppConfig()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [connectionState, setConnectionState] = useState<ConnectionUiState>('connecting')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [sendPending, setSendPending] = useState(false)

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const chatChannelRef = useRef<Ably.RealtimeChannel | null>(null)

  useEffect(() => {
    let canceled = false

    let clientId = localStorage.getItem(CHAT_CLIENT_ID_KEY)
    if (!clientId) {
      clientId = `ufc-${crypto.randomUUID()}`
      localStorage.setItem(CHAT_CLIENT_ID_KEY, clientId)
    }

    const client = new Ably.Realtime({
      authUrl: '/api/ably-token',
      authMethod: 'GET',
      authParams: { clientId },
      clientId,
    })

    const onConnectionState = (stateChange: Ably.ConnectionStateChange) => {
      if (canceled) return
      setConnectionState(resolveConnectionState(stateChange.current))
      if (stateChange.reason?.message) {
        setErrorMessage(String(stateChange.reason.message))
      }
    }
    client.connection.on(onConnectionState)
    setConnectionState(resolveConnectionState(client.connection.state))

    const channel = client.channels.get(ablyChannel || 'chat:ufc:live')
    chatChannelRef.current = channel

    const onIncomingMessage = (rawMessage: Ably.InboundMessage) => {
      const normalized = normalizeMessage(rawMessage)
      if (!normalized) return
      setMessages((current) => mergeMessages(current, [normalized]))
    }

    void channel
      .history({ limit: 60 })
      .then((result: Ably.PaginatedResult<Ably.InboundMessage>) => {
        if (canceled) return
        const historyMessages = Array.isArray(result.items)
          ? result.items.map((item) => normalizeMessage(item)).filter(isChatMessage)
          : []
        setMessages((current) => mergeMessages(current, historyMessages))
      })
      .catch((error: unknown) => {
        if (canceled) return
        const message = error instanceof Error ? error.message : '메시지 기록을 불러오지 못했습니다.'
        setErrorMessage(message)
      })

    void channel.subscribe('message', onIncomingMessage).catch((error: unknown) => {
      if (canceled && isExpectedConnectionClosure(error)) return
      if (canceled) return

      const message = error instanceof Error ? error.message : '채팅 구독을 시작하지 못했습니다.'
      setErrorMessage(message)
      setConnectionState('failed')
    })

    return () => {
      canceled = true
      channel.unsubscribe('message', onIncomingMessage)
      client.connection.off(onConnectionState)
      client.close()
      chatChannelRef.current = null
    }
  }, [address, ablyChannel])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [messages.length])

  const canSend = useMemo(() => {
    return draft.trim().length > 0 && !sendPending && connectionState === 'connected'
  }, [connectionState, draft, sendPending])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const channel = chatChannelRef.current
    if (!channel || !canSend) return

    const text = draft.trim().slice(0, MESSAGE_MAX_LENGTH)
    if (!text) return

    setSendPending(true)
    setErrorMessage(undefined)

    try {
      await channel.publish('message', {
        text,
        name: sanitizeSenderName(nickname) || getProfileDisplayName(address, nickname),
        sentAt: Date.now(),
      })
      setDraft('')
    } catch (error) {
      const message = error instanceof Error ? error.message : '메시지 전송에 실패했습니다.'
      setErrorMessage(message)
    } finally {
      setSendPending(false)
    }
  }

  return {
    messages,
    draft,
    setDraft,
    connectionState,
    errorMessage,
    canSend,
    scrollContainerRef,
    handleSubmit,
  }
}
