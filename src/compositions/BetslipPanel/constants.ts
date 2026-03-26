import { translate } from '../../i18n'

export function getDisableReasonLabel(reason: string) {
  const labels: Record<string, string> = {
    TotalOddsTooLow: translate('betslip.disable.TotalOddsTooLow'),
    ComboWithSameGame: translate('betslip.disable.ComboWithSameGame'),
    ComboWithForbiddenItem: translate('betslip.disable.ComboWithForbiddenItem'),
    ConditionState: translate('betslip.disable.ConditionState'),
    MarketStateMismatch: translate('betslip.disable.MarketStateMismatch'),
    FreeBetExpired: translate('betslip.disable.FreeBetExpired'),
    SelectedOutcomesTemporarySuspended: translate('betslip.disable.SelectedOutcomesTemporarySuspended'),
    BetAmountGreaterThanMaxBet: translate('betslip.disable.BetAmountGreaterThanMaxBet'),
    BetAmountLowerThanMinBet: translate('betslip.disable.BetAmountLowerThanMinBet'),
  }

  return labels[reason] ?? reason
}
