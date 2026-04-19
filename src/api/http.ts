export const JSON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
} as const

export const ACCEPT_JSON_HEADERS = {
  Accept: 'application/json',
} as const

async function readJson(response: Response): Promise<unknown> {
  return response.json().catch(() => ({}))
}

function getApiError(payload: unknown, fallbackMessage: string) {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const error = (payload as { error?: unknown }).error
    if (typeof error === 'string' && error) return error
  }

  return fallbackMessage
}

export async function getJson(url: string, fallbackMessage: string): Promise<unknown> {
  const response = await fetch(url, {
    method: 'GET',
    headers: ACCEPT_JSON_HEADERS,
  })
  const payload = await readJson(response)

  if (!response.ok) {
    throw new Error(getApiError(payload, fallbackMessage))
  }

  return payload
}

export async function postJson(url: string, body: unknown, fallbackMessage: string): Promise<unknown> {
  const response = await fetch(url, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  })
  const payload = await readJson(response)

  if (!response.ok) {
    throw new Error(getApiError(payload, fallbackMessage))
  }

  return payload
}
