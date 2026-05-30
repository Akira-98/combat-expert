import { normalizeAddress } from './env.js'
import { supabaseInsert, supabaseSelect } from './supabase.js'

const MAX_SHARE_SELECTIONS = 20
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function firstRow(rows) {
  return Array.isArray(rows) ? rows[0] : undefined
}

function normalizeShareId(value) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  return UUID_PATTERN.test(trimmed) ? trimmed : ''
}

function normalizeSelection(selection) {
  if (!selection || typeof selection !== 'object') return undefined

  const conditionId = String(selection.conditionId ?? '').trim()
  const outcomeId = String(selection.outcomeId ?? '').trim()
  const gameId = String(selection.gameId ?? '').trim()
  const gameTitle = String(selection.gameTitle ?? '').trim()
  const label = String(selection.label ?? '').trim()
  const marketTitle = String(selection.marketTitle ?? '').trim()
  const selectionName = String(selection.selectionName ?? '').trim()
  const odds = Number(selection.odds)

  if (!conditionId || !outcomeId || !gameId) return undefined

  const normalized = {
    conditionId,
    outcomeId,
    gameId,
    isExpressForbidden: Boolean(selection.isExpressForbidden),
  }

  if (gameTitle) normalized.gameTitle = gameTitle
  if (label) normalized.label = label
  if (marketTitle) normalized.marketTitle = marketTitle
  if (selectionName) normalized.selectionName = selectionName
  if (Number.isFinite(odds) && odds > 0) normalized.odds = odds

  return normalized
}

function normalizeReferralSelections(value) {
  if (!Array.isArray(value)) return []
  if (value.length === 0 || value.length > MAX_SHARE_SELECTIONS) return []

  const selections = value.map(normalizeSelection)
  if (selections.some((selection) => !selection)) return []

  return selections
}

function mapReferralShare(row) {
  if (!row) return undefined

  return {
    id: typeof row.id === 'string' ? row.id : '',
    referrerWallet: normalizeAddress(row.referrer_wallet),
    selections: normalizeReferralSelections(row.selections),
    status: typeof row.status === 'string' ? row.status : '',
    createdAt: typeof row.created_at === 'string' ? row.created_at : '',
    expiresAt: typeof row.expires_at === 'string' ? row.expires_at : null,
  }
}

export async function createReferralShare({ supabaseUrl, serviceRoleKey, referrerWallet, selections }) {
  const normalizedReferrerWallet = normalizeAddress(referrerWallet)
  const normalizedSelections = Array.isArray(selections) ? normalizeReferralSelections(selections) : []

  if (!normalizedReferrerWallet) {
    return { ok: false, status: 'invalid_referrer_wallet', error: 'Invalid referrer wallet' }
  }

  if (Array.isArray(selections) && selections.length > 0 && normalizedSelections.length === 0) {
    return { ok: false, status: 'invalid_selections', error: 'Invalid selections' }
  }

  const rows = await supabaseInsert({
    supabaseUrl,
    serviceRoleKey,
    table: 'referral_shares',
    errorMessage: 'Failed to create referral share',
    body: {
      referrer_wallet: normalizedReferrerWallet,
      selections: normalizedSelections,
    },
  })

  return {
    ok: true,
    share: mapReferralShare(firstRow(rows)),
  }
}

export async function fetchReferralShareById({ supabaseUrl, serviceRoleKey, shareId }) {
  const normalizedShareId = normalizeShareId(shareId)
  if (!normalizedShareId) {
    return { ok: false, status: 'invalid_share_id', error: 'Invalid share id' }
  }

  const rows = await supabaseSelect({
    supabaseUrl,
    serviceRoleKey,
    path: `referral_shares?id=eq.${encodeURIComponent(normalizedShareId)}&select=id,referrer_wallet,selections,status,created_at,expires_at`,
    errorMessage: 'Failed to fetch referral share',
  })

  const share = mapReferralShare(firstRow(rows))
  if (!share?.id) {
    return { ok: false, status: 'not_found', error: 'Referral share was not found' }
  }

  if (share.status !== 'active') {
    return { ok: false, status: 'inactive', error: 'Referral share is not active', share }
  }

  if (share.expiresAt && Date.parse(share.expiresAt) <= Date.now()) {
    return { ok: false, status: 'expired', error: 'Referral share has expired', share }
  }

  return { ok: true, share }
}
