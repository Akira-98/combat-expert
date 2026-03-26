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
    <div className="space-y-2 rounded-md border border-slate-200 bg-white p-3 md:rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">{t('betslip.slippage')}</span>
        <span className="text-xs text-slate-500">{slippage}%</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {[0.5, 1, 3, 5].map((value) => (
          <button
            key={value}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              slippage === value
                ? 'border border-blue-600 bg-blue-50 text-blue-700'
                : 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
            }`}
            onClick={() => onSlippageChange(value)}
            type="button"
          >
            {value}%
          </button>
        ))}
      </div>
      <div className="border-t border-slate-200 pt-2">
        <button
          className="text-xs font-semibold text-slate-600 underline-offset-2 hover:underline"
          onClick={() => setIsAdvancedOpen((open) => !open)}
          type="button"
        >
          {isAdvancedOpen ? t('betslip.slippageAdvancedClose') : t('betslip.slippageAdvancedOpen')}
        </button>

        {isAdvancedOpen && (
          <div className="mt-2 grid gap-1">
            <span className="text-xs text-slate-500">{t('betslip.slippageCustom')}</span>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm md:rounded-lg"
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
