const MAX_SERIALIZED_ERROR_DEPTH = 4
const MAX_SERIALIZED_ARRAY_ITEMS = 20
const MAX_SERIALIZED_STRING_LENGTH = 1_000
const ERROR_DETAIL_KEYS = [
  'name',
  'code',
  'message',
  'shortMessage',
  'details',
  'operation',
  'reason',
  'action',
  'method',
  'url',
  'status',
  'statusCode',
  'statusText',
  'request',
  'response',
  'info',
  'error',
  'cause',
  'body',
  'data',
]

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return String(error ?? '')
}

export function getErrorCode(error: unknown) {
  if (!error || typeof error !== 'object' || !('code' in error)) return undefined
  const value = (error as Record<string, unknown>).code
  return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined
}

export function getErrorName(error: unknown) {
  if (error instanceof Error) return error.name
  if (!error || typeof error !== 'object' || !('name' in error)) return undefined
  const value = (error as Record<string, unknown>).name
  return typeof value === 'string' ? value : undefined
}

export function getErrorStack(error: unknown) {
  return error instanceof Error ? error.stack : undefined
}

function getStringValue(record: Record<string, unknown>, key: string) {
  const value = record[key]
  return typeof value === 'string' ? value : undefined
}

function getSerializableValue(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'string') return value.slice(0, MAX_SERIALIZED_STRING_LENGTH)
  if (!value || typeof value !== 'object') return value

  if (seen.has(value)) return '[Circular]'
  if (depth >= MAX_SERIALIZED_ERROR_DEPTH) return '[MaxDepth]'

  seen.add(value)

  if (Array.isArray(value)) {
    return value.slice(0, MAX_SERIALIZED_ARRAY_ITEMS).map((item) => getSerializableValue(item, depth + 1, seen))
  }

  const record = value as Record<string, unknown>
  const entries = value instanceof Error ? ERROR_DETAIL_KEYS : Object.keys(record)

  const serialized = Object.fromEntries(
    entries
      .filter((key) => key in record)
      .map((key) => [key, getSerializableValue(record[key], depth + 1, seen)])
      .filter(([, item]) => item !== undefined),
  )

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      ...serialized,
    }
  }

  return serialized
}

export function getErrorDetails(error: unknown): Record<string, unknown> {
  if (!error || typeof error !== 'object') {
    return { raw: String(error ?? '') }
  }

  const record = error as Record<string, unknown>

  return {
    name: getErrorName(error),
    code: getErrorCode(error),
    message: getErrorMessage(error),
    shortMessage: getStringValue(record, 'shortMessage'),
    details: getStringValue(record, 'details'),
    operation: getStringValue(record, 'operation'),
    reason: getStringValue(record, 'reason'),
    action: getStringValue(record, 'action'),
    method: getStringValue(record, 'method'),
    url: getStringValue(record, 'url'),
    info: getSerializableValue(record.info),
    request: getSerializableValue(record.request),
    response: getSerializableValue(record.response),
    nestedError: getSerializableValue(record.error),
    cause: getSerializableValue(record.cause),
  }
}
