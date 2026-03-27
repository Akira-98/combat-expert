import { useState } from 'react'
import { useI18n } from '../../i18n'

type BetslipSlippageSettingsProps = {
  isOpen: boolean
  slippage: number
  onSlippageChange: (value: number) => void
}

export function BetslipSlippageSettings({ isOpen, slippage, onSlippageChange }: BetslipSlippageSettingsProps) {
  const { t } = useI18n()
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  if (!isOpen) return null

  return (
    <div className="card-surface card-shell space-y-2 p-3 md:rounded-lg">
      <div className="flex items-center justify-between">
        <span className="ui-text-strong text-sm font-semibold">{t('betslip.slippage')}</span>
        <span className="ui-text-muted text-xs">{slippage}%</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {[0.5, 1, 3, 5].map((value) => (
          <button
            key={value}
            className={`btn-pill px-3 py-1.5 text-xs font-semibold transition ${
              slippage === value ? 'ui-btn-primary' : 'ui-btn-secondary'
            }`}
            onClick={() => onSlippageChange(value)}
            type="button"
          >
            {value}%
          </button>
        ))}
      </div>
      <div className="ui-border border-t pt-2">
        <button
          className="ui-text-body text-xs font-semibold underline-offset-2 hover:underline"
          onClick={() => setIsAdvancedOpen((open) => !open)}
          type="button"
        >
          {isAdvancedOpen ? t('betslip.slippageAdvancedClose') : t('betslip.slippageAdvancedOpen')}
        </button>

        {isAdvancedOpen && (
          <div className="mt-2 grid gap-1">
            <span className="ui-text-muted text-xs">{t('betslip.slippageCustom')}</span>
            <input
              className="ui-input w-full rounded-md border px-3 py-2 text-sm md:rounded-lg"
              type="number"
              min={0.1}
              max={50}
              step={0.1}
              value={slippage}
              onChange={(e) => onSlippageChange(Number(e.target.value))}
            />
          </div>
        )}
      </div>
    </div>
  )
}
