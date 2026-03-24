import type { FormEvent } from 'react'
import type { Address } from 'viem'
import type { useProfile } from '../../hooks/useProfile'
import { formatLiveChatMessageTime, useLiveChat } from '../../hooks/useLiveChat'
import { DesktopStickyRail } from './DesktopSidebarLayout'

type DesktopChatRailProps = {
  address?: Address
  profile: ReturnType<typeof useProfile>
}

export function DesktopChatRail({ address, profile }: DesktopChatRailProps) {
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

  return (
    <DesktopStickyRail className="md:border-r md:border-[color:var(--app-border)] md:bg-[color:var(--app-surface)]">
      <section className="ui-surface grid h-full min-h-0 w-full grid-rows-[auto_1fr_auto] border-0">
        <div className="flex items-center gap-2 border-b border-[color:var(--app-border)] px-4 py-4">
          <h2 className="ui-text-strong m-0 text-lg font-semibold">Live Chat</h2>
        </div>

        <div className="min-h-0 px-4 py-4">
          <div ref={scrollContainerRef} className="card-surface-soft card-shell min-h-0 h-full w-full overflow-y-auto">
            {messages.length === 0 ? (
              <p className="ui-text-muted m-0 px-3 py-3 text-xs">아직 메시지가 없습니다. 첫 메시지를 남겨보세요.</p>
            ) : (
              <div className="grid w-full content-start gap-0 justify-items-stretch">
                {messages.map((message) => (
                  <article
                    key={message.id}
                    className="card-surface w-full justify-self-stretch border-x-0 border-t-0 px-3 py-2 shadow-none last:border-b-0"
                  >
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

        <form className="grid gap-2 border-t border-[color:var(--app-border)] px-4 py-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <input
              className="ui-input h-9 rounded-md border px-3 text-sm outline-none md:rounded-lg"
              placeholder={connectionState === 'connected' ? '메시지를 입력하세요' : '연결 후 입력 가능합니다'}
              value={draft}
              maxLength={220}
              onChange={(event) => setDraft(event.target.value)}
              disabled={connectionState !== 'connected'}
            />
            <button
              className="ui-btn-primary shrink-0 whitespace-nowrap rounded-md border px-3 py-2 text-xs font-semibold md:rounded-lg disabled:opacity-50"
              type="submit"
              disabled={!canSend}
            >
              전송
            </button>
          </div>
          {errorMessage ? <p className="ui-state-danger m-0 rounded-md border px-2 py-1 text-[11px]">{errorMessage}</p> : null}
        </form>
      </section>
    </DesktopStickyRail>
  )
}
