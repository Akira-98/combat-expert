import { useState } from 'react'
import { normalizeProfileNickname } from '../../helpers/profile'
import { shortenAddress } from '../../helpers/walletUi'
import type { RankingViewer } from '../../hooks/useRankings'
import { useI18n } from '../../i18n'

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
  const { t } = useI18n()
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
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <p className="ui-text-strong m-0 truncate text-sm font-semibold">{profileDisplayName}</p>
              <InlineNicknameEditor
                isProfileSaving={isProfileSaving}
                onSaveNickname={onSaveNickname}
                primaryButtonClass={primaryButtonClass}
                profileErrorMessage={profileErrorMessage}
                profileNickname={profileNickname}
              />
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <p className="ui-text-muted truncate text-xs">{shortenAddress(address, 6, 4)}</p>
              <div className="relative">
                <button
                  aria-label={copyLabel === 'idle' ? t('account.copyAddress') : copyLabel === 'copied' ? t('account.copiedAddress') : t('account.copyAddressFailed')}
                  className={smallIconButtonClass}
                  onClick={onCopyAddress}
                  title={copyLabel === 'idle' ? t('account.copyAddress') : copyLabel === 'copied' ? t('account.copiedAddress') : t('account.copyAddressFailed')}
                  type="button"
                >
                  <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <rect height="11" rx="2" stroke="currentColor" strokeWidth="1.8" width="11" x="9" y="9" />
                    <path d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </button>
                {copyLabel !== 'idle' && (
                  <span className={copyToastClass}>{copyLabel === 'copied' ? t('account.copiedAddress') : t('account.copyAddressFailed')}</span>
                )}
              </div>
              <button aria-label={t('header.logout')} className={smallIconButtonClass} onClick={onDisconnect} title={t('header.logout')} type="button">
                <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <path d="M14 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M10 12h10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                  <path d="m17 8 4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <button className={`${iconButtonClass} shrink-0 md:hidden`} onClick={onClose} title={t('account.close')} type="button">
          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.8" />
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      </div>

      <div className="border-t border-white/8 pt-1">
        <section className={`${rowClass} items-center`}>
          <div>
            <p className="ui-text-muted m-0 text-[11px] font-medium uppercase tracking-[0.18em]">{t('account.balance')}</p>
          </div>
          <p className="ui-text-strong m-0 text-sm font-semibold">{usdtBalanceLabel}</p>
        </section>

        <section className={rowClass}>
          <div className="min-w-0">
            <p className="ui-text-muted m-0 text-[11px] font-medium uppercase tracking-[0.18em]">{t('account.myRanking')}</p>
            {isRankingLoading ? (
              <p className="ui-text-muted mt-1 mb-0 text-xs">{t('ranking.loading')}</p>
            ) : rankingViewer ? (
              <p className="ui-text-strong mt-2 mb-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">
                <span>{`#${rankingViewer.rank}`}</span>
                <span aria-hidden="true" className="ui-text-muted text-xs font-medium">
                  |
                </span>
                <span>{`${formatRankingScore(rankingViewer.totalScore)} ${t('ranking.totalScore')}`}</span>
                <span aria-hidden="true" className="ui-text-muted text-xs font-medium">
                  |
                </span>
                <span>{t('ranking.winsLosses', { wins: rankingViewer.winCount, losses: rankingViewer.loseCount })}</span>
                <span aria-hidden="true" className="ui-text-muted text-xs font-medium">
                  |
                </span>
                <span>{t('ranking.predictions', { count: rankingViewer.eventCount })}</span>
              </p>
            ) : (
              <>
                <p className="ui-text-strong mt-1 mb-0 text-sm font-semibold">{t('ranking.noData')}</p>
                <p className="ui-text-muted mt-1 mb-0 text-xs">{t('ranking.noDataDesc')}</p>
              </>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}

function formatRankingScore(score: number) {
  return Math.round(score).toLocaleString('en-US')
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
  const { t } = useI18n()
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
      setNicknameNotice(nextNickname ? t('account.nicknameSaved') : t('account.nicknameReset'))
      setIsEditing(false)
    } catch {
      // Surface the API error below instead of duplicating it here.
    }
  }

  return (
    <>
      {!isEditing ? (
        <button
          aria-label={trimmedProfileNickname ? t('account.editNickname') : t('account.addNickname')}
          className={`${iconActionClass} shrink-0`}
          onClick={() => {
            setNicknameDraft(profileNickname || '')
            setNicknameNotice(undefined)
            setIsEditing(true)
          }}
          title={trimmedProfileNickname ? t('account.editNickname') : t('account.addNickname')}
          type="button"
        >
          <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <path d="m4 20 4.2-1 9.3-9.3a1.7 1.7 0 0 0 0-2.4l-.8-.8a1.7 1.7 0 0 0-2.4 0L5 15.8 4 20Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
            <path d="M13 8l3 3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          </svg>
        </button>
      ) : (
        <div className="mt-2 grid basis-full gap-2">
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              className={nicknameInputClass}
              maxLength={24}
              placeholder={t('account.nicknamePlaceholder')}
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
              aria-label={t('account.saveNickname')}
              className={primaryButtonClass}
              disabled={isProfileSaving}
              onClick={() => void handleSaveNickname()}
              type="button"
            >
              {isProfileSaving ? t('common.saving') : t('common.save')}
            </button>
            <button
              aria-label={t('account.cancelNicknameEdit')}
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
          <p className="ui-text-muted m-0 text-[11px]">{t('account.nicknameHint')}</p>
        </div>
      )}

      {nicknameNotice && !profileErrorMessage && <p className={`ui-state-success ${noticeClass}`}>{nicknameNotice}</p>}
      {profileErrorMessage && <p className={`ui-state-danger ${noticeClass}`}>{profileErrorMessage}</p>}
    </>
  )
}
