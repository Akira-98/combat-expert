import type { Freebet } from '@azuro-org/toolkit'
import { useI18n } from '../../i18n'

type BetslipFreebetSectionProps = {
  freebets?: Freebet[] | null
  selectedFreebet?: Freebet
  isLoading?: boolean
  isOpen: boolean
  onSelectFreebet: (freebet?: Freebet) => void
}

const formatAmount = (amount: string) => {
  const value = Number(amount)
  return Number.isFinite(value) ? value.toFixed(2) : amount
}

const formatExpiry = (expiresAt: number) => {
  if (!Number.isFinite(expiresAt)) return '-'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(expiresAt))
}

export function BetslipFreebetSection({
  freebets,
  selectedFreebet,
  isLoading = false,
  isOpen,
  onSelectFreebet,
}: BetslipFreebetSectionProps) {
  const { t } = useI18n()

  if (!isOpen) return null

  const availableFreebets = freebets ?? []
  const actionButtonClass =
    'btn-shell inline-flex h-7 shrink-0 items-center justify-center px-2.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60'

  return (
    <div className="card-surface card-shell space-y-2 p-2.5 md:rounded-lg">
      <div className="flex items-center justify-between gap-3">
        <span className="ui-text-strong text-xs font-semibold uppercase tracking-[0.16em]">{t('betslip.freebets')}</span>
        {isLoading && <span className="ui-text-muted text-xs">{t('betslip.freebetsChecking')}</span>}
      </div>

      {!isLoading && availableFreebets.length === 0 && (
        <p className="ui-text-muted m-0 text-xs">{t('betslip.freebetsEmpty')}</p>
      )}

      {availableFreebets.length > 0 && (
        <div className="grid gap-1.5">
          {availableFreebets.map((freebet) => {
            const isSelected = selectedFreebet?.id === freebet.id
            const payoutMode = freebet.params.isSponsoredBetReturnable
              ? t('betslip.freebetStakeReturned')
              : t('betslip.freebetProfitOnly')

            return (
              <div
                key={freebet.id}
                className={`flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 ${
                  isSelected
                    ? 'border-[color:color-mix(in_srgb,var(--app-accent)_60%,transparent)] bg-[color:color-mix(in_srgb,var(--app-accent)_14%,transparent)] text-[color:var(--app-text-strong)]'
                    : 'border-[color:var(--app-border)] bg-[color:color-mix(in_srgb,var(--app-surface-soft)_80%,transparent)]'
                }`}
              >
                <span className="min-w-0">
                  <strong className="ui-text-strong block truncate text-xs font-semibold">
                    {t('betslip.freebetAmount', { amount: formatAmount(freebet.amount) })}
                  </strong>
                  <span className="ui-text-muted mt-0.5 block truncate text-[11px]">
                    {payoutMode} · {t('betslip.freebetExpires', { date: formatExpiry(freebet.expiresAt) })}
                  </span>
                </span>
                <button
                  className={`${actionButtonClass} ${isSelected ? 'ui-btn-primary' : 'ui-btn-secondary'}`}
                  onClick={() => onSelectFreebet(isSelected ? undefined : freebet)}
                  type="button"
                >
                  {isSelected ? t('betslip.freebetSelected') : t('betslip.freebetUse')}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {selectedFreebet && (
        <button
          className="ui-text-body text-xs font-semibold underline-offset-2 hover:underline"
          onClick={() => onSelectFreebet(undefined)}
          type="button"
        >
          {t('betslip.freebetClear')}
        </button>
      )}
    </div>
  )
}
