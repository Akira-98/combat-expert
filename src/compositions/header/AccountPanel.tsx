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
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img alt="" className="h-14 w-14 rounded-full border object-cover" src={avatarUrl} />
          <div className="min-w-0">
            <p className="ui-text-strong m-0 truncate text-sm font-semibold">{profileDisplayName}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <p className="ui-text-muted truncate text-xs">{shortenAddress(address, 6, 4)}</p>
              <button
                aria-label={copyLabel === 'idle' ? '주소 복사' : copyLabel === 'copied' ? '주소 복사됨' : '주소 복사 실패'}
                className={`${iconButtonClass} h-7 w-7 rounded-full border`}
                onClick={onCopyAddress}
                title={copyLabel === 'idle' ? '주소 복사' : copyLabel === 'copied' ? '주소 복사됨' : '주소 복사 실패'}
                type="button"
              >
                <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <rect height="11" rx="2" stroke="currentColor" strokeWidth="1.8" width="11" x="9" y="9" />
                  <path d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </button>
              <button aria-label="로그아웃" className={`${iconButtonClass} h-7 w-7 rounded-full border`} onClick={onDisconnect} title="로그아웃" type="button">
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

      <div className="mt-4 rounded-xl border px-3 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <p className="ui-text-muted m-0 text-[11px] font-medium">보유 잔액</p>
          <p className="ui-text-strong m-0 text-xs font-semibold">{usdtBalanceLabel}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border px-3 py-3">
        <p className="ui-text-muted m-0 text-[11px] font-medium uppercase tracking-[0.18em]">내 랭킹</p>
        {isRankingLoading ? (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="h-14 rounded-xl border border-white/8 bg-white/4" />
            <div className="h-14 rounded-xl border border-white/8 bg-white/4" />
          </div>
        ) : rankingViewer ? (
          <>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div>
                <p className="ui-text-strong m-0 text-lg font-semibold">#{rankingViewer.rank}</p>
                <p className="ui-text-muted mt-1 mb-0 text-xs">현재 내 리더보드 순위</p>
              </div>
              <button className="ui-btn-secondary rounded-lg border px-3 py-2 text-xs font-semibold" onClick={onOpenRanking} type="button">
                전체 랭킹
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MetricTile label="순위" value={`#${rankingViewer.rank}`} />
              <MetricTile label="총점" value={rankingViewer.totalScore.toFixed(1)} />
            </div>
          </>
        ) : (
          <>
            <p className="ui-text-strong mt-2 mb-0 text-sm font-semibold">아직 랭킹 데이터가 없습니다.</p>
            <p className="ui-text-muted mt-1 mb-0 text-xs">예측이 정산되면 내 점수와 순위를 여기서 바로 확인할 수 있습니다.</p>
          </>
        )}
      </div>

      <div className="mt-4 rounded-xl border px-3 py-2.5">
        <NicknameEditor
          key={profileNickname || '__empty__'}
          isProfileSaving={isProfileSaving}
          onSaveNickname={onSaveNickname}
          primaryButtonClass={primaryButtonClass}
          profileErrorMessage={profileErrorMessage}
          profileNickname={profileNickname}
        />
      </div>
    </>
  )
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/4 px-2.5 py-2">
      <p className="ui-text-muted m-0 text-[10px] font-medium uppercase tracking-[0.16em]">{label}</p>
      <p className="ui-text-strong mt-1 mb-0 text-sm font-bold">{value}</p>
    </div>
  )
}

type NicknameEditorProps = {
  isProfileSaving: boolean
  onSaveNickname: (nickname: string) => Promise<unknown>
  primaryButtonClass: string
  profileErrorMessage?: string
  profileNickname?: string | null
}

function NicknameEditor({
  isProfileSaving,
  onSaveNickname,
  primaryButtonClass,
  profileErrorMessage,
  profileNickname,
}: NicknameEditorProps) {
  const [nicknameDraft, setNicknameDraft] = useState(profileNickname || '')
  const [nicknameNotice, setNicknameNotice] = useState<string>()

  const handleSaveNickname = async () => {
    const nextNickname = normalizeProfileNickname(nicknameDraft)

    try {
      await onSaveNickname(nextNickname)
      setNicknameNotice(nextNickname ? '닉네임이 저장되었습니다.' : '닉네임이 초기화되었습니다.')
    } catch {
      // Surface the API error below instead of duplicating it here.
    }
  }

  return (
    <>
      <label className="ui-text-muted grid gap-1 text-[11px] font-medium">
        닉네임
        <input
          className="ui-input h-9 rounded-md border px-2 text-sm"
          maxLength={24}
          placeholder="비워두면 주소로 표시됩니다"
          value={nicknameDraft}
          onChange={(event) => {
            setNicknameDraft(event.target.value)
            setNicknameNotice(undefined)
          }}
        />
      </label>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="ui-text-muted m-0 text-[11px]">변경 시 지갑 서명이 필요합니다.</p>
        <button className={primaryButtonClass} disabled={isProfileSaving} onClick={handleSaveNickname} type="button">
          {isProfileSaving ? '저장 중...' : '저장'}
        </button>
      </div>
      {nicknameNotice && !profileErrorMessage && <p className="ui-state-success mt-2 mb-0 rounded-md border px-2 py-1 text-[11px]">{nicknameNotice}</p>}
      {profileErrorMessage && <p className="ui-state-danger mt-2 mb-0 rounded-md border px-2 py-1 text-[11px]">{profileErrorMessage}</p>}
    </>
  )
}
