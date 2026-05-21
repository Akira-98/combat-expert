import { createHash } from 'node:crypto'
import { loadServerEnv } from '../_lib/env.js'
import { allowMethods, sendJson, sendServerError } from '../_lib/http.js'
import { supabaseInsert } from '../_lib/supabase.js'

const ALLOWED_EVENTS = new Set([
  'submit_start',
  'submit_timeout',
  'order_created',
  'bet_success',
  'bet_error',
])

function asString(value, maxLength = 500) {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, maxLength)
}

function asBoolean(value) {
  return typeof value === 'boolean' ? value : undefined
}

function asInteger(value) {
  return Number.isInteger(value) ? value : undefined
}

function asJsonObject(value, maxLength = 4000) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined

  try {
    const json = JSON.stringify(value)
    if (json.length > maxLength) {
      return {
        truncated: true,
        preview: json.slice(0, maxLength),
      }
    }
    return value
  } catch {
    return { serialization_error: true }
  }
}

function getWalletTail(walletAddress) {
  const wallet = asString(walletAddress, 128)
  if (!wallet) return undefined
  return wallet.slice(-6)
}

function getWalletHash(walletAddress) {
  const wallet = asString(walletAddress, 128)
  if (!wallet) return undefined
  return createHash('sha256').update(wallet.toLowerCase()).digest('hex')
}

function buildEventRow(req) {
  const body = req.body ?? {}
  const event = asString(body.event, 80)

  if (!event || !ALLOWED_EVENTS.has(event)) {
    return { error: 'Invalid event' }
  }

  return {
    row: {
      event,
      wallet_tail: getWalletTail(body.walletAddress),
      wallet_hash: getWalletHash(body.walletAddress),
      is_aa_wallet: asBoolean(body.isAAWallet),
      selection_count: asInteger(body.selectionCount),
      has_freebet: asBoolean(body.hasFreebet),
      bet_amount: asString(body.betAmount, 80),
      order_id: asString(body.orderId, 160),
      order_state: asString(body.orderState, 80),
      error_code: asString(body.errorCode, 160),
      error_message: asString(body.errorMessage, 500),
      error_name: asString(body.errorName, 160),
      error_stack: asString(body.errorStack, 2000),
      error_details: asJsonObject(body.errorDetails),
      user_agent: asString(req.headers['user-agent'], 500),
    },
  }
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return

  const { supabaseUrl, serviceRoleKey } = loadServerEnv()

  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(res, 500, { error: 'Supabase server env is missing' })
  }

  const { row, error } = buildEventRow(req)
  if (error) return sendJson(res, 400, { error })

  try {
    await supabaseInsert({
      supabaseUrl,
      serviceRoleKey,
      table: 'bet_debug_events',
      body: row,
      errorMessage: 'Failed to insert bet debug event',
    })

    return sendJson(res, 200, { ok: true })
  } catch (insertError) {
    return sendServerError(res, insertError, 'Failed to record bet debug event')
  }
}
