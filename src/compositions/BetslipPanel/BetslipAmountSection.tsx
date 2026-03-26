import { useI18n } from '../../i18n'

type BetslipAmountSectionProps = {
  betAmount: string
  onBetAmountChange: (value: string) => void
}

const chipClass =
  'rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50'

export function BetslipAmountSection({ betAmount, onBetAmountChange }: BetslipAmountSectionProps) {
  const { t } = useI18n()
  const currentAmount = Number(betAmount || '0')

  const applyChip = (delta: number) => {
    const next = Number.isFinite(currentAmount) ? currentAmount + delta : delta
    onBetAmountChange(String(Math.max(0, Number(next.toFixed(4)))))
  }

  return (
    <>
      <label className="grid gap-1">
        <span className="text-xs font-semibold text-slate-600">{t('betslip.amount')}</span>
        <input
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm md:rounded-lg"
          value={betAmount}
          onChange={(e) => onBetAmountChange(e.target.value)}
          placeholder={t('betslip.amountPlaceholder')}
          inputMode="decimal"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {[1, 5, 10, 25].map((chip) => (
          <button key={chip} className={chipClass} onClick={() => applyChip(chip)} type="button">
            +{chip}
          </button>
        ))}
        <button className={chipClass} onClick={() => onBetAmountChange('')} type="button">
          {t('betslip.reset')}
        </button>
      </div>
    </>
  )
}
