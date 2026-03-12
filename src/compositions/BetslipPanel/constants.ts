export const DISABLE_REASON_LABEL: Record<string, string> = {
  TotalOddsTooLow: '총 배당이 1.00 이하라 베팅할 수 없습니다.',
  ComboWithSameGame: '같은 경기의 선택을 조합 베팅에 함께 담을 수 없습니다.',
  ComboWithForbiddenItem: '현재 선택 중 조합 베팅 불가 항목이 포함되어 있습니다.',
  ConditionState: '선택한 아웃컴 상태가 변경되어 지금은 베팅할 수 없습니다.',
  MarketStateMismatch: '마켓 상태 동기화가 아직 완료되지 않았습니다. 잠시 후 다시 시도해 주세요.',
  FreeBetExpired: '무료 베팅 사용 가능 시간이 만료되었습니다.',
  SelectedOutcomesTemporarySuspended: '선택 아웃컴이 일시 중단되어 있습니다.',
  BetAmountGreaterThanMaxBet: '입력 금액이 최대 허용 베팅 금액을 초과했습니다.',
  BetAmountLowerThanMinBet: '입력 금액이 최소 허용 베팅 금액보다 작습니다.',
}
