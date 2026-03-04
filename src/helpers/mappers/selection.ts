import type { SelectionKey } from '../../types/ui'

export const selectionKey = (conditionId: string, outcomeId: string): SelectionKey =>
  `${conditionId}-${outcomeId}`
