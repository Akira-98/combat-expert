import { useState, type FormEvent } from 'react'
import type { GameItem } from '../../types/ui'
import { formatCommentTime, COMMENT_MAX_LENGTH } from '../../helpers/comments'
import { useMarketComments } from '../../hooks/useMarketComments'

type MarketCommentsPanelProps = {
  selectedGame?: GameItem
  address?: `0x${string}`
  isConnected: boolean
  isAAWallet?: boolean
  onConnectWallet: () => void
}

export function MarketCommentsPanel({
  selectedGame,
  address,
  isConnected,
  isAAWallet,
  onConnectWallet,
}: MarketCommentsPanelProps) {
  const comments = useMarketComments({
    marketId: selectedGame?.gameId,
    address,
    isConnected,
    isAAWallet,
  })
  const canInteract = isConnected || comments.isAuthenticated

  if (!selectedGame) return null

  return (
    <section className="card-surface card-shell-lg grid gap-3 p-3 md:p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="ui-text-strong m-0 text-sm font-semibold">댓글</h3>
        </div>
        <span className="ui-pill rounded-full border px-2 py-0.5 text-[11px] font-semibold">{comments.comments.length}</span>
      </div>

      {comments.errorMessage && <p className="ui-state-danger m-0 rounded-md border px-2 py-1 text-[11px]">{comments.errorMessage}</p>}

      <div className="grid gap-0">
        {comments.isLoading ? (
          <p className="ui-text-muted m-0 text-xs">댓글을 불러오는 중...</p>
        ) : comments.comments.length === 0 ? (
          <p className="ui-text-muted m-0 text-xs">아직 댓글이 없습니다. 아래에서 첫 댓글을 남겨보세요.</p>
        ) : (
          comments.comments.map((comment) => (
            <article key={comment.id} className="border-b border-white/8 py-3 last:border-b-0 last:pb-0 first:pt-0">
              <div className="flex items-center justify-between gap-3">
                <p className="ui-text-strong m-0 text-xs font-semibold">{comments.getAuthorLabel(comment)}</p>
                <time className="ui-text-muted text-[11px]">{formatCommentTime(comment.createdAt)}</time>
              </div>
              <p className="ui-text-body m-0 mt-1 whitespace-pre-wrap break-words text-sm leading-6">{comment.content}</p>
            </article>
          ))
        )}
      </div>

      <div className="border-t border-white/8 pt-3">
        <CommentComposer
          key={selectedGame.gameId}
          canInteract={canInteract}
          isSubmitting={comments.isSubmitting}
          onConnectWallet={onConnectWallet}
          onSubmit={comments.createComment}
        />
      </div>
    </section>
  )
}

type CommentComposerProps = {
  canInteract: boolean
  isSubmitting: boolean
  onConnectWallet: () => void
  onSubmit: (draft: string) => Promise<unknown>
}

function CommentComposer({
  canInteract,
  isSubmitting,
  onConnectWallet,
  onSubmit,
}: CommentComposerProps) {
  const [draft, setDraft] = useState('')
  const canSubmit = Boolean(draft.trim() && !isSubmitting && canInteract)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    try {
      await onSubmit(draft)
      setDraft('')
    } catch {
      // Error is surfaced by the hook state above.
    }
  }

  return (
    <form className="grid gap-2" onSubmit={handleSubmit}>
      <textarea
        className="ui-input min-h-24 rounded-md border px-3 py-2 text-sm"
        maxLength={COMMENT_MAX_LENGTH}
        placeholder={canInteract ? '이 마켓에 대한 생각을 남겨보세요' : '댓글을 작성하려면 지갑 연결이 필요합니다'}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        disabled={!canInteract || isSubmitting}
      />
      <div className="flex items-center justify-between gap-2">
        <p className="ui-text-muted m-0 text-[11px]">
          {canInteract ? `${draft.trim().length}/${COMMENT_MAX_LENGTH}` : '첫 댓글 로그인 시 지갑 서명이 1회 필요합니다.'}
        </p>
        {canInteract ? (
          <button className="ui-btn-primary rounded-lg border px-3 py-2 text-sm font-semibold" disabled={!canSubmit} type="submit">
            {isSubmitting ? '등록 중...' : '등록'}
          </button>
        ) : (
          <button className="ui-btn-secondary rounded-lg border px-3 py-2 text-sm font-semibold" onClick={onConnectWallet} type="button">
            지갑 연결
          </button>
        )}
      </div>
    </form>
  )
}
