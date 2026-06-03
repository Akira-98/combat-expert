import { useState } from 'react'
import type { MyReferral } from '../../api/referrals'
import { copyTextToClipboard } from '../../helpers/share'
import { useI18n } from '../../i18n'

const COPY_FEEDBACK_TIMEOUT_MS = 1600

type ReferralPanelProps = {
  referral: MyReferral
}

export function ReferralPanel({ referral }: ReferralPanelProps) {
  const { t } = useI18n()
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  const handleCopyReferralLink = async () => {
    try {
      await copyTextToClipboard(referral.referralUrl)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }

    window.setTimeout(() => setCopyState('idle'), COPY_FEEDBACK_TIMEOUT_MS)
  }

  const copyLabel = copyState === 'copied'
    ? t('profile.referralCopied')
    : copyState === 'failed'
      ? t('profile.referralCopyFailed')
      : t('profile.referralCopy')

  return (
    <section className="ui-profile-list grid gap-3 rounded-xl border border-[color:var(--app-border)] p-4">
      <div className="grid gap-1">
        <div className="flex items-center gap-2">
          <div className="ui-profile-icon">
            <ReferralLinkIcon />
          </div>
          <p className="ui-text-strong m-0 text-sm font-black">{t('profile.referralTitle')}</p>
        </div>
        <p className="ui-text-muted m-0 text-xs font-semibold">{t('profile.referralCode', { code: referral.code })}</p>
      </div>

      <div className="grid min-w-0 gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
        <p className="ui-text-strong m-0 truncate rounded-md border border-[color:var(--app-border)] px-3 py-2 text-xs font-semibold">
          {referral.referralUrl}
        </p>
        <button
          className="ui-btn-primary rounded-md border px-4 py-2 text-xs font-black transition"
          onClick={handleCopyReferralLink}
          type="button"
        >
          {copyLabel}
        </button>
      </div>
    </section>
  )
}

function ReferralLinkIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}
