import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import type { Address } from 'viem'
import { getProfileDisplayName } from '../helpers/profile'
import { translate } from '../i18n'
import { MESSAGE_MAX_LENGTH, sanitizeSenderName } from './liveChat'
import { useLiveChatConnection } from './useLiveChatConnection'
export { formatLiveChatMessageTime } from './liveChat'

type UseLiveChatParams = {
  address?: Address
  nickname?: string | null
}

export function useLiveChat({ address, nickname }: UseLiveChatParams) {
  const [draft, setDraft] = useState('')
  const [sendPending, setSendPending] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const { messages, connectionState, errorMessage, setErrorMessage, chatChannelRef } = useLiveChatConnection()

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
        name: sanitizeSenderName(nickname || getProfileDisplayName(address, nickname)),
        sentAt: Date.now(),
      })
      setDraft('')
    } catch (error) {
      const message = error instanceof Error ? error.message : translate('liveChat.sendFailed')
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
