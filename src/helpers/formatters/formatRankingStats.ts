export function formatSignedUsdt(value: number, options: { suffix?: boolean } = {}) {
  const sign = value > 0 ? '+' : ''
  const suffix = options.suffix === false ? '' : ' USDT'
  return `${sign}${value.toFixed(2)}${suffix}`
}

export function formatPercentRatio(value: number) {
  if (!Number.isFinite(value)) return '-'
  return `${(value * 100).toFixed(0)}%`
}
