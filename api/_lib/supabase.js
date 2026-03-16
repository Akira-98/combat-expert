function buildHeaders(serviceRoleKey, extraHeaders = {}) {
  return {
    Accept: 'application/json',
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...extraHeaders,
  }
}

export async function supabaseSelect({ supabaseUrl, serviceRoleKey, path, errorMessage }) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method: 'GET',
    headers: buildHeaders(serviceRoleKey),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || errorMessage)
  }

  return response.json()
}

export async function supabaseInsert({ supabaseUrl, serviceRoleKey, table, body, prefer, errorMessage }) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: buildHeaders(serviceRoleKey, {
      'Content-Type': 'application/json',
      Prefer: prefer || 'return=representation',
    }),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || errorMessage)
  }

  return response.json()
}
