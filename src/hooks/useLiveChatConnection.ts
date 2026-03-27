import { useEffect, useRef, useState } from 'react'
import * as Ably from 'ably'
import { useAppConfig } from '../config/useAppConfig'
import { translate } from '../i18n'
import {
  type ChatMessage,
  type ConnectionUiState,
  isChatMessage,
  isExpectedConnectionClosure,
  mergeChatMessages,
  normalizeChatMessage,
  resolveConnectionState,
} from './liveChat'

const CHAT_CLIENT_ID_KEY = 'ufc-live-chat-client-id'

export function useLiveChatConnection() {
  const { ablyChannel } = useAppConfig()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connectionState, setConnectionState] = useState<ConnectionUiState>('connecting')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
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
        console.warn('[live-chat] realtime connection state change', {
          current: stateChange.current,
          previous: stateChange.previous,
          message: String(stateChange.reason.message),
        })
      }
    }

    client.connection.on(onConnectionState)

    const channel = client.channels.get(ablyChannel || 'chat:ufc:live')
    chatChannelRef.current = channel

    const onIncomingMessage = (rawMessage: Ably.InboundMessage) => {
      const normalized = normalizeChatMessage(rawMessage)
      if (!normalized) return
      setMessages((current) => mergeChatMessages(current, [normalized]))
    }

    void channel
      .history({ limit: 60 })
      .then((result: Ably.PaginatedResult<Ably.InboundMessage>) => {
        if (canceled) return
        const historyMessages = Array.isArray(result.items)
          ? result.items.map((item) => normalizeChatMessage(item)).filter(isChatMessage)
          : []
        setMessages((current) => mergeChatMessages(current, historyMessages))
      })
      .catch((error: unknown) => {
        if (canceled) return
        const message = error instanceof Error ? error.message : translate('liveChat.historyFailed')
        setErrorMessage(message)
      })

    void channel.subscribe('message', onIncomingMessage).catch((error: unknown) => {
      if (canceled && isExpectedConnectionClosure(error)) return
      if (canceled) return

      const message = error instanceof Error ? error.message : translate('liveChat.subscribeFailed')
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
  }, [ablyChannel])

  return {
    messages,
    connectionState,
    errorMessage,
    setErrorMessage,
    chatChannelRef,
  }
}
