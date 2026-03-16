import { useEffect, useState, type FormEvent } from 'react'
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
  const [draft, setDraft] = useState('')
  const comments = useMarketComments({
    marketId: selectedGame?.gameId,
    address,
    isConnected,
    isAAWallet,
  })

  useEffect(() => {
    setDraft('')
  }, [selectedGame?.gameId])

  const canSubmit = Boolean(selectedGame?.gameId && draft.trim() && !comments.isSubmitting)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    try {
      await comments.createComment(draft)
      setDraft('')
    } catch {
      // Error is surfaced by the hook state below.
    }
  }

  if (!selectedGame) return null

  return (
    <section className="ui-surface grid gap-3 rounded-md border p-3 md:rounded-xl md:p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="ui-text-strong m-0 text-sm font-semibold">댓글</h3>
          <p className="ui-text-muted mt-1 text-xs">{selectedGame.title}에 대한 의견을 남겨보세요.</p>
        </div>
        <span className="ui-pill rounded-full border px-2 py-0.5 text-[11px] font-semibold">{comments.comments.length}</span>
      </div>

      <form className="grid gap-2" onSubmit={handleSubmit}>
        <textarea
          className="ui-input min-h-24 rounded-md border px-3 py-2 text-sm"
          maxLength={COMMENT_MAX_LENGTH}
          placeholder={isConnected ? '이 마켓에 대한 생각을 남겨보세요' : '댓글을 작성하려면 지갑 연결이 필요합니다'}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={!isConnected || comments.isSubmitting}
        />
        <div className="flex items-center justify-between gap-2">
          <p className="ui-text-muted m-0 text-[11px]">
            {isConnected ? `${draft.trim().length}/${COMMENT_MAX_LENGTH}` : '댓글 작성 시 지갑 서명이 필요합니다.'}
          </p>
          {isConnected ? (
            <button className="ui-btn-primary rounded-lg border px-3 py-2 text-sm font-semibold" disabled={!canSubmit} type="submit">
              {comments.isSubmitting ? '등록 중...' : '댓글 등록'}
            </button>
          ) : (
            <button className="ui-btn-secondary rounded-lg border px-3 py-2 text-sm font-semibold" onClick={onConnectWallet} type="button">
              지갑 연결
            </button>
          )}
        </div>
      </form>

      {comments.errorMessage && <p className="ui-state-danger m-0 rounded-md border px-2 py-1 text-[11px]">{comments.errorMessage}</p>}

      <div className="grid gap-2">
        {comments.isLoading ? (
          <p className="ui-text-muted m-0 text-xs">댓글을 불러오는 중...</p>
        ) : comments.comments.length === 0 ? (
          <p className="ui-text-muted m-0 text-xs">아직 댓글이 없습니다. 첫 댓글을 남겨보세요.</p>
        ) : (
          comments.comments.map((comment) => (
            <article key={comment.id} className="ui-surface-soft rounded-md border px-3 py-2 md:rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <p className="ui-text-strong m-0 text-xs font-semibold">{comments.getAuthorLabel(comment)}</p>
                <time className="ui-text-muted text-[11px]">{formatCommentTime(comment.createdAt)}</time>
              </div>
              <p className="ui-text-body m-0 mt-1 whitespace-pre-wrap break-words text-sm">{comment.content}</p>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
