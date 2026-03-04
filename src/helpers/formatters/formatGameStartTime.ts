import { parseGameStartTimeMs } from '../parseGameStartTime'

export const formatGameStartTime = (value: string) =>
  new Date(parseGameStartTimeMs(value)).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
