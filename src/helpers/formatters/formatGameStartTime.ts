import { parseGameStartTimeMs } from '../parseGameStartTime'
import { formatCompactDateTime } from './formatCompactDateTime'

export const formatGameStartTime = (value: string) => formatCompactDateTime(parseGameStartTimeMs(value))
