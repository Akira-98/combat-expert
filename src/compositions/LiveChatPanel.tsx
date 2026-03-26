import type { FormEvent } from 'react'
import type { Address } from 'viem'
import type { useProfile } from '../hooks/useProfile'
import { useI18n } from '../i18n'
import { formatLiveChatMessageTime, useLiveChat } from '../hooks/useLiveChat'

type LiveChatPanelProps = {
  address?: Address
  profile: ReturnType<typeof useProfile>
  className?: string
  isEmbedded?: boolean
}
const MESSAGE_MAX_LENGTH = 220

export function LiveChatPanel({ address, profile, className, isEmbedded = false }: LiveChatPanelProps) {
  const { t } = useI18n()
  const chat = useLiveChat({ address, nickname: profile.nickname })
  const {
    scrollContainerRef,
    messages,
    connectionState,
    draft,
    setDraft,
    canSend,
    errorMessage,
    handleSubmit: submitChat,
  } = chat

  const handleSubmit = (event: FormEvent) => {
    void submitChat(event)
  }

  const rootClassName = isEmbedded
    ? `grid h-full w-full min-w-0 grid-rows-[auto_1fr_auto] gap-2.5 p-3 md:gap-3 md:p-4 ${className ?? ''}`.trim()
    : className
      ? `panel section-shell grid w-full min-w-0 ${className} grid-rows-[auto_1fr_auto] gap-2.5 p-2.5 md:rounded-2xl md:border md:gap-3 md:p-4`
      : 'panel section-shell grid w-full min-w-0 h-[calc(100dvh-8rem)] grid-rows-[auto_1fr_auto] gap-2.5 p-2.5 md:rounded-2xl md:border md:gap-3 md:p-4'

  return (
    <div className={rootClassName}>
      <div className="flex w-full items-center gap-2">
        <h2 className="ui-text-strong m-0 text-lg font-semibold">Live Chat</h2>
      </div>

      <div>
        <div
          ref={scrollContainerRef}
          className="card-surface-soft card-shell min-h-0 h-full w-full overflow-y-auto p-1.5 md:p-2"
        >
          {messages.length === 0 ? (
            <p className="ui-text-muted m-0 px-1 py-2 text-xs">{t('chat.empty')}</p>
          ) : (
            <div className="grid w-full content-start gap-1.5 justify-items-stretch md:gap-2">
              {messages.map((message) => (
                <article key={message.id} className="card-surface card-shell w-full justify-self-stretch px-2 py-1 md:py-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="ui-text-body text-xs font-semibold">{message.senderName}</span>
                    <time className="ui-text-muted text-[11px]">{formatLiveChatMessageTime(message.timestamp)}</time>
                  </div>
                  <p className="ui-text-strong m-0 mt-1 break-words text-sm leading-5">{message.text}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <form className="grid w-full gap-2" onSubmit={handleSubmit}>
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2">
          <input
            className="ui-input h-10 rounded-md border px-3 text-base outline-none md:rounded-lg"
            placeholder={connectionState === 'connected' ? t('chat.placeholder.connected') : t('chat.placeholder.disconnected')}
            value={draft}
            maxLength={MESSAGE_MAX_LENGTH}
            onChange={(event) => setDraft(event.target.value)}
            disabled={connectionState !== 'connected'}
          />
          <button
            className="ui-btn-primary shrink-0 whitespace-nowrap rounded-md border px-3 py-2 text-xs font-semibold md:rounded-lg disabled:opacity-50"
            type="submit"
            disabled={!canSend}
          >
            {t('common.send')}
          </button>
        </div>
        {errorMessage && <p className="ui-state-danger m-0 rounded-md border px-2 py-1 text-[11px]">{errorMessage}</p>}
      </form>
    </div>
  )
}
