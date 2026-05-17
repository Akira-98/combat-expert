import type { Freebet } from '@azuro-org/toolkit'
import { useI18n } from '../../i18n'

type BetslipFreebetSectionProps = {
  freebets?: Freebet[] | null
  selectedFreebet?: Freebet
  isLoading?: boolean
  isOpen: boolean
  onSelectFreebet: (freebet?: Freebet) => void
}

const getDefaultFreebet = (freebets: Freebet[]) => {
  return freebets.reduce<Freebet | undefined>((selected, freebet) => {
    if (!selected) return freebet
    if (!Number.isFinite(freebet.expiresAt)) return selected
    if (!Number.isFinite(selected.expiresAt)) return freebet
    return freebet.expiresAt < selected.expiresAt ? freebet : selected
  }, undefined)
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
  const defaultFreebet = getDefaultFreebet(availableFreebets)
  const isDisabled = isLoading || (!selectedFreebet && !defaultFreebet)
  const buttonLabel = isLoading
    ? t('betslip.freebetsChecking')
    : selectedFreebet
      ? t('betslip.freebetApplied')
      : t('betslip.useFreebet')
  const buttonClassName = selectedFreebet
    ? 'inline-flex h-10 w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,color-mix(in_oklab,var(--app-accent)_36%,black)_0%,color-mix(in_oklab,var(--app-accent)_44%,black)_58%,color-mix(in_oklab,var(--app-accent)_32%,black)_100%)] px-4 text-sm font-bold text-white/80 shadow-none ring-1 ring-white/10 transition hover:brightness-100 disabled:cursor-not-allowed disabled:opacity-60'
    : 'inline-flex h-10 w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,color-mix(in_oklab,var(--app-accent)_70%,white)_0%,var(--app-accent)_58%,color-mix(in_oklab,var(--app-accent)_72%,black)_100%)] px-4 text-sm font-bold text-white shadow-[0_0_0_1px_color-mix(in_srgb,var(--app-accent)_34%,transparent),0_8px_18px_-14px_var(--app-accent)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60'

  return (
    <button
      aria-label={buttonLabel}
      className={buttonClassName}
      disabled={isDisabled}
      onClick={() => onSelectFreebet(selectedFreebet ? undefined : defaultFreebet)}
      type="button"
    >
      {buttonLabel}
    </button>
  )
}
