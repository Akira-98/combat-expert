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

  return (
    <div className="card-surface card-shell space-y-2 p-3 md:rounded-lg">
      <div className="flex items-center justify-between gap-3">
        <span className="ui-text-strong text-sm font-semibold">{t('betslip.freebets')}</span>
        {isLoading && <span className="ui-text-muted text-xs">{t('betslip.freebetsChecking')}</span>}
      </div>

      {!isLoading && availableFreebets.length === 0 && (
        <p className="ui-text-muted m-0 text-xs">{t('betslip.freebetsEmpty')}</p>
      )}

      {availableFreebets.length > 0 && (
        <div className="grid gap-2">
          {availableFreebets.map((freebet) => {
            const isSelected = selectedFreebet?.id === freebet.id
            const payoutMode = freebet.params.isSponsoredBetReturnable
              ? t('betslip.freebetStakeReturned')
              : t('betslip.freebetProfitOnly')

            return (
              <button
                key={freebet.id}
                className={`rounded-md border p-2 text-left transition md:rounded-lg ${
                  isSelected ? 'ui-btn-primary' : 'ui-btn-secondary'
                }`}
                onClick={() => onSelectFreebet(isSelected ? undefined : freebet)}
                type="button"
              >
                <span className="flex items-center justify-between gap-2">
                  <strong className="text-sm">{t('betslip.freebetAmount', { amount: formatAmount(freebet.amount) })}</strong>
                  <span className="text-xs font-semibold">{isSelected ? t('betslip.freebetSelected') : t('betslip.freebetUse')}</span>
                </span>
                <span className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs opacity-80">
                  <span>{payoutMode}</span>
                  <span>{t('betslip.freebetExpires', { date: formatExpiry(freebet.expiresAt) })}</span>
                </span>
              </button>
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
