export function parseGameStartTimeMs(value: string): number {
  const numeric = Number(value)
  if (Number.isFinite(numeric)) {
    // Subgraph can return unix timestamp in seconds; treat small values as seconds.
    return numeric < 10_000_000_000 ? numeric * 1000 : numeric
  }

  const parsed = new Date(value).getTime()
  return Number.isFinite(parsed) ? parsed : NaN
}

