import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import * as Ably from 'ably'
import type { Address } from 'viem'
import { useAppConfig } from '../config/useAppConfig'

const CHAT_CLIENT_ID_KEY = 'ufc-live-chat-client-id'
const CHAT_DISPLAY_NAME_KEY = 'ufc-live-chat-display-name'
const MESSAGE_LIMIT = 180
const MESSAGE_MAX_LENGTH = 220

type LiveChatPanelProps = {
  address?: Address
}

type ChatMessage = {
  id: string
  text: string
  senderName: string
  timestamp: number
}

type ConnectionUiState = 'connecting' | 'connected' | 'disconnected' | 'failed'

function shortAddress(address?: string) {
  if (!address) return 'Guest'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function sanitizeSenderName(value: string) {
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

function connectionStateLabel(state: ConnectionUiState) {
  if (state === 'connected') return '연결됨'
  if (state === 'failed') return '연결 실패'
  if (state === 'disconnected') return '연결 끊김'
  return '연결 중'
}

function formatMessageTime(timestamp: number) {
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

export function LiveChatPanel({ address }: LiveChatPanelProps) {
  const { ablyChannel } = useAppConfig()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [displayName, setDisplayName] = useState(() => shortAddress(address))
  const [connectionState, setConnectionState] = useState<ConnectionUiState>('connecting')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [sendPending, setSendPending] = useState(false)

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const chatChannelRef = useRef<Ably.RealtimeChannel | null>(null)

  useEffect(() => {
    if (!address) return
    setDisplayName((current) => (current === 'Guest' ? shortAddress(address) : current))
  }, [address])

  useEffect(() => {
    let canceled = false

    const savedDisplayName = localStorage.getItem(CHAT_DISPLAY_NAME_KEY)
    const nextDisplayName = sanitizeSenderName(savedDisplayName || shortAddress(address))
    setDisplayName(nextDisplayName)

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

    void channel.subscribe('message', onIncomingMessage)

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
        name: sanitizeSenderName(displayName),
        sentAt: Date.now(),
      })
      setDraft('')
      localStorage.setItem(CHAT_DISPLAY_NAME_KEY, sanitizeSenderName(displayName))
    } catch (error) {
      const message = error instanceof Error ? error.message : '메시지 전송에 실패했습니다.'
      setErrorMessage(message)
    } finally {
      setSendPending(false)
    }
  }

  return (
    <div className="ui-surface grid h-[calc(100dvh-8rem)] grid-rows-[auto_1fr_auto] gap-3 rounded-xl border p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="ui-text-muted m-0 text-xs font-semibold uppercase tracking-[0.08em]">Live Chat</p>
          <p className="ui-text-strong mt-1 text-sm font-semibold">UFC 실시간 채팅</p>
        </div>
        <span
          className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${
            connectionState === 'connected'
              ? 'ui-state-success'
              : connectionState === 'failed'
                ? 'ui-state-danger'
                : 'ui-state-warning'
          }`}
        >
          {connectionStateLabel(connectionState)}
        </span>
      </div>

      <div
        ref={scrollContainerRef}
        className="ui-surface-soft min-h-0 space-y-2 overflow-y-auto rounded-lg border p-2"
      >
        {messages.length === 0 ? (
          <p className="ui-text-muted m-0 px-1 py-2 text-xs">아직 메시지가 없습니다. 첫 메시지를 남겨보세요.</p>
        ) : (
          messages.map((message) => (
            <article key={message.id} className="ui-surface rounded-lg border px-2 py-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="ui-text-body text-xs font-semibold">{message.senderName}</span>
                <time className="ui-text-muted text-[11px]">{formatMessageTime(message.timestamp)}</time>
              </div>
              <p className="ui-text-strong m-0 mt-1 break-words text-sm leading-5">{message.text}</p>
            </article>
          ))
        )}
      </div>

      <form className="grid gap-2" onSubmit={handleSubmit}>
        <label className="ui-text-muted grid gap-1 text-[11px] font-semibold">
          닉네임
          <input
            className="ui-input h-8 rounded-md border px-2 text-xs"
            value={displayName}
            maxLength={24}
            onChange={(event) => setDisplayName(event.target.value)}
            onBlur={() => localStorage.setItem(CHAT_DISPLAY_NAME_KEY, sanitizeSenderName(displayName))}
          />
        </label>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input
            className="ui-input h-9 rounded-lg border px-3 text-sm outline-none"
            placeholder={connectionState === 'connected' ? '메시지를 입력하세요' : '연결 후 입력 가능합니다'}
            value={draft}
            maxLength={MESSAGE_MAX_LENGTH}
            onChange={(event) => setDraft(event.target.value)}
            disabled={connectionState !== 'connected'}
          />
          <button
            className="ui-btn-primary rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50"
            type="submit"
            disabled={!canSend}
          >
            전송
          </button>
        </div>
        {errorMessage && <p className="ui-state-danger m-0 rounded-md border px-2 py-1 text-[11px]">{errorMessage}</p>}
      </form>
    </div>
  )
}
