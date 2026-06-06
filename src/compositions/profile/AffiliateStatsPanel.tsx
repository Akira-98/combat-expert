import type { AffiliateDashboard } from '../../api/referrals'
import { useI18n } from '../../i18n'

type AffiliateStatsPanelProps = {
  affiliate?: AffiliateDashboard
  isLoading: boolean
}

export function AffiliateStatsPanel({ affiliate, isLoading }: AffiliateStatsPanelProps) {
  const { t } = useI18n()

  if (isLoading && !affiliate) {
    return (
      <section className="ui-profile-list grid gap-3 rounded-xl border border-[color:var(--app-border)] p-4">
        <div className="card-surface-soft h-20 rounded-lg" />
        <div className="card-surface-soft h-28 rounded-lg" />
      </section>
    )
  }

  if (!affiliate) return null

  return (
    <section className="ui-profile-list grid gap-4 rounded-xl border border-[color:var(--app-border)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <div className="flex items-center gap-2">
            <div className="ui-profile-icon">
              <AffiliateIcon />
            </div>
            <p className="ui-text-strong m-0 text-sm font-black">{t('profile.affiliateTitle')}</p>
          </div>
          <p className="ui-text-muted m-0 text-xs font-semibold">
            {t('profile.affiliateRate', { rate: formatRate(affiliate.commissionRateBps) })}
          </p>
        </div>
        {affiliate.summary.syncedAt && (
          <p className="ui-text-muted m-0 shrink-0 text-right text-[10px] font-bold uppercase">
            {formatShortDate(affiliate.summary.syncedAt)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <AffiliateMetric label={t('profile.affiliateReferred')} value={formatInteger(affiliate.summary.referredUserCount)} />
        <AffiliateMetric label={t('profile.affiliateBets')} value={formatInteger(affiliate.summary.betCount)} />
        <AffiliateMetric label={t('profile.affiliateVolume')} value={formatUsdt(affiliate.summary.volumeUsdt)} />
        <AffiliateMetric label={t('profile.affiliateCommission')} value={formatUsdt(affiliate.summary.estimatedCommissionUsdt)} />
      </div>
    </section>
  )
}

function AffiliateMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--app-border)] px-3 py-3">
      <p className="ui-text-muted m-0 truncate text-[10px] font-bold uppercase tracking-[0.08em]">{label}</p>
      <p className="ui-text-strong m-0 mt-1 truncate text-sm font-black md:text-base">{value}</p>
    </div>
  )
}

function AffiliateIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M12 3v18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M7 7h7.5a3 3 0 0 1 0 6H9.5a3 3 0 0 0 0 6H17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

function formatInteger(value: number | string) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? new Intl.NumberFormat('en-US').format(numberValue) : '0'
}

function formatUsdt(value: number | string) {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '0.00 USDT'
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(numberValue)} USDT`
}

function formatRate(rateBps: number) {
  return `${(rateBps / 100).toFixed(2).replace(/\.?0+$/, '')}%`
}

function formatShortDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}
