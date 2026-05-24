export type FreebetSummaryInput = {
  amount: string
  expiresAt: number
}

export function getFreebetSummary(freebets: FreebetSummaryInput[]) {
  const count = freebets.length
  const total = freebets.reduce((sum, freebet) => {
    const amount = Number(freebet.amount)
    return Number.isFinite(amount) ? sum + amount : sum
  }, 0)
  const earliestExpiresAt = freebets.reduce<number | undefined>((earliest, freebet) => {
    if (!Number.isFinite(freebet.expiresAt)) return earliest
    if (earliest === undefined) return freebet.expiresAt
    return Math.min(earliest, freebet.expiresAt)
  }, undefined)

  return {
    count,
    totalAmount: formatFreebetAmount(total),
    earliestExpiry: earliestExpiresAt ? formatFreebetExpiry(earliestExpiresAt) : undefined,
  }
}

function formatFreebetAmount(amount: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatFreebetExpiry(expiresAt: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(expiresAt))
}
