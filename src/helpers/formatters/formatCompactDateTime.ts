function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function formatCompactDateTime(value: string | number | Date) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())

  return `${month}.${day} ${hours}:${minutes}`
}
