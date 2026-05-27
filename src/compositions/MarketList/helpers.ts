export { normalizeOutcomeLabel } from '../../helpers/outcomes'

export const truncateLabel = (label: string, max = 14) => (label.length > max ? `${label.slice(0, max - 1)}…` : label)

export const outcomePreviewPriority = (selectionName: string) => {
  const raw = selectionName.trim().toLowerCase()
  if (raw === '1') return 0
  if (raw === 'x' || raw === 'draw') return 1
  if (raw === '2') return 2
  return 10
}
