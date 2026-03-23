import { useState } from 'react'
import { normalizeProfileNickname } from '../../helpers/profile'
import { shortenAddress } from '../../helpers/walletUi'
import type { RankingViewer } from '../../hooks/useRankings'

type AccountPanelProps = {
  address?: `0x${string}`
  avatarUrl: string
  profileDisplayName: string
  profileNickname?: string | null
  isProfileSaving: boolean
  profileErrorMessage?: string
  onSaveNickname: (nickname: string) => Promise<unknown>
  rankingViewer: RankingViewer | null
  isRankingLoading: boolean
  usdtBalanceLabel: string
  iconButtonClass: string
  primaryButtonClass: string
  copyLabel: 'idle' | 'copied' | 'failed'
  onCopyAddress: () => void
  onDisconnect: () => void
  onClose: () => void
  onOpenRanking: () => void
}

export function AccountPanel({
  address,
  avatarUrl,
  profileDisplayName,
  profileNickname,
  isProfileSaving,
  profileErrorMessage,
  onSaveNickname,
  rankingViewer,
  isRankingLoading,
  usdtBalanceLabel,
  iconButtonClass,
  primaryButtonClass,
  copyLabel,
  onCopyAddress,
  onDisconnect,
  onClose,
  onOpenRanking,
}: AccountPanelProps) {
  void onOpenRanking
  const smallIconButtonClass = `${iconButtonClass} h-7 w-7 rounded-full border`
  const rowClass = 'flex items-start justify-between gap-3 border-b border-white/8 py-3 last:border-b-0 last:pb-0'
  const copyToastClass =
    copyLabel === 'copied'
      ? 'ui-state-success absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-semibold shadow-lg'
      : 'ui-state-danger absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-semibold shadow-lg'

  return (
    <section className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img alt="" className="h-14 w-14 rounded-full border object-cover" src={avatarUrl} />
          <div className="min-w-0">
            <p className="ui-text-strong m-0 truncate text-sm font-semibold">{profileDisplayName}</p>
            <InlineNicknameEditor
              isProfileSaving={isProfileSaving}
              onSaveNickname={onSaveNickname}
              primaryButtonClass={primaryButtonClass}
              profileErrorMessage={profileErrorMessage}
              profileNickname={profileNickname}
            />
            <div className="mt-1 flex items-center gap-1.5">
              <p className="ui-text-muted truncate text-xs">{shortenAddress(address, 6, 4)}</p>
              <div className="relative">
                <button
                  aria-label={copyLabel === 'idle' ? '주소 복사' : copyLabel === 'copied' ? '주소 복사됨' : '주소 복사 실패'}
                  className={smallIconButtonClass}
                  onClick={onCopyAddress}
                  title={copyLabel === 'idle' ? '주소 복사' : copyLabel === 'copied' ? '주소 복사됨' : '주소 복사 실패'}
                  type="button"
                >
                  <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <rect height="11" rx="2" stroke="currentColor" strokeWidth="1.8" width="11" x="9" y="9" />
                    <path d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </button>
                {copyLabel !== 'idle' && <span className={copyToastClass}>{copyLabel === 'copied' ? 'Copy' : 'Fail'}</span>}
              </div>
              <button aria-label="로그아웃" className={smallIconButtonClass} onClick={onDisconnect} title="로그아웃" type="button">
                <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <path d="M14 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M10 12h10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                  <path d="m17 8 4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <button className={`${iconButtonClass} shrink-0 md:hidden`} onClick={onClose} title="닫기" type="button">
          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.8" />
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      </div>

      <div className="border-t border-white/8 pt-1">
        <section className={`${rowClass} items-center`}>
          <div>
            <p className="ui-text-muted m-0 text-[11px] font-medium uppercase tracking-[0.18em]">보유 잔액</p>
          </div>
          <p className="ui-text-strong m-0 text-sm font-semibold">{usdtBalanceLabel}</p>
        </section>

        <section className={rowClass}>
          <div className="min-w-0">
            <p className="ui-text-muted m-0 text-[11px] font-medium uppercase tracking-[0.18em]">내 랭킹</p>
            {isRankingLoading ? (
              <p className="ui-text-muted mt-1 mb-0 text-xs">랭킹을 불러오는 중...</p>
            ) : rankingViewer ? (
              <div className="mt-2 grid gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <RankingMetric label="현재 순위" value={`#${rankingViewer.rank}`} />
                  <RankingMetric label="총점" value={rankingViewer.totalScore.toFixed(1)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <RankingMetric label="승 / 패" value={`${rankingViewer.winCount} / ${rankingViewer.loseCount}`} />
                  <RankingMetric label="무효" value={String(rankingViewer.voidCount)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <RankingMetric label="언더독 적중" value={String(rankingViewer.underdogHitCount)} />
                  <RankingMetric label="예측 경기 수" value={String(rankingViewer.eventCount)} />
                </div>
              </div>
            ) : (
              <>
                <p className="ui-text-strong mt-1 mb-0 text-sm font-semibold">아직 랭킹 데이터가 없습니다.</p>
                <p className="ui-text-muted mt-1 mb-0 text-xs">예측 정산 후 점수와 순위를 여기서 확인할 수 있습니다.</p>
              </>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}

function RankingMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
      <p className="ui-text-muted m-0 text-[10px] font-medium uppercase tracking-[0.16em]">{label}</p>
      <p className="ui-text-strong mt-1 mb-0 text-sm font-semibold">{value}</p>
    </div>
  )
}

type InlineNicknameEditorProps = {
  isProfileSaving: boolean
  onSaveNickname: (nickname: string) => Promise<unknown>
  primaryButtonClass: string
  profileErrorMessage?: string
  profileNickname?: string | null
}

function InlineNicknameEditor({
  isProfileSaving,
  onSaveNickname,
  primaryButtonClass,
  profileErrorMessage,
  profileNickname,
}: InlineNicknameEditorProps) {
  const nicknameInputClass = 'ui-input h-8 rounded-md border px-2.5 text-xs'
  const iconActionClass =
    'ui-text-body inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60'
  const noticeClass = 'mt-2 mb-0 rounded-md border px-2 py-1 text-[11px]'
  const trimmedProfileNickname = normalizeProfileNickname(profileNickname || '')
  const [nicknameDraft, setNicknameDraft] = useState(profileNickname || '')
  const [nicknameNotice, setNicknameNotice] = useState<string>()
  const [isEditing, setIsEditing] = useState(false)

  const handleSaveNickname = async () => {
    const nextNickname = normalizeProfileNickname(nicknameDraft)

    try {
      await onSaveNickname(nextNickname)
      setNicknameNotice(nextNickname ? '닉네임이 저장되었습니다.' : '닉네임이 초기화되었습니다.')
      setIsEditing(false)
    } catch {
      // Surface the API error below instead of duplicating it here.
    }
  }

  return (
    <div className="mt-1">
      {!isEditing ? (
        <div className="flex items-center gap-1.5">
          <p className="ui-text-muted m-0 truncate text-xs">{trimmedProfileNickname || '닉네임 없음'}</p>
          <button
            aria-label="닉네임 수정"
            className={iconActionClass}
            onClick={() => {
              setNicknameDraft(profileNickname || '')
              setNicknameNotice(undefined)
              setIsEditing(true)
            }}
            title="닉네임 수정"
            type="button"
          >
            <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
              <path d="m4 20 4.2-1 9.3-9.3a1.7 1.7 0 0 0 0-2.4l-.8-.8a1.7 1.7 0 0 0-2.4 0L5 15.8 4 20Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
              <path d="M13 8l3 3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="grid gap-2">
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              className={nicknameInputClass}
              maxLength={24}
              placeholder="닉네임 입력"
              value={nicknameDraft}
              onChange={(event) => {
                setNicknameDraft(event.target.value)
                setNicknameNotice(undefined)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void handleSaveNickname()
                }
                if (event.key === 'Escape') {
                  setNicknameDraft(profileNickname || '')
                  setNicknameNotice(undefined)
                  setIsEditing(false)
                }
              }}
            />
            <button
              aria-label="닉네임 저장"
              className={primaryButtonClass}
              disabled={isProfileSaving}
              onClick={() => void handleSaveNickname()}
              type="button"
            >
              {isProfileSaving ? '저장 중...' : '저장'}
            </button>
            <button
              aria-label="닉네임 편집 취소"
              className={iconActionClass}
              onClick={() => {
                setNicknameDraft(profileNickname || '')
                setNicknameNotice(undefined)
                setIsEditing(false)
              }}
              type="button"
            >
              <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <path d="M6 6 18 18M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              </svg>
            </button>
          </div>
          <p className="ui-text-muted m-0 text-[11px]">엔터로 저장, ESC로 취소할 수 있습니다.</p>
        </div>
      )}

      {nicknameNotice && !profileErrorMessage && <p className={`ui-state-success ${noticeClass}`}>{nicknameNotice}</p>}
      {profileErrorMessage && <p className={`ui-state-danger ${noticeClass}`}>{profileErrorMessage}</p>}
    </div>
  )
}
