import { normalizeAddress, normalizeTxHash } from './env.js'
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

function normalizePickShareSelections(value) {
  if (!Array.isArray(value)) return []
  if (value.length === 0 || value.length > MAX_SHARE_SELECTIONS) return []

  const selections = value.map(normalizeSelection)
  if (selections.some((selection) => !selection)) return []

  return selections
}

function mapPickShare(row) {
  if (!row) return undefined

  const sharerWallet = normalizeAddress(row.sharer_wallet)
  return {
    id: typeof row.id === 'string' ? row.id : '',
    sharerWallet,
    referrerWallet: sharerWallet,
    selections: normalizePickShareSelections(row.selections),
    status: typeof row.status === 'string' ? row.status : '',
    createdAt: typeof row.created_at === 'string' ? row.created_at : '',
    expiresAt: typeof row.expires_at === 'string' ? row.expires_at : null,
  }
}

function selectionKey(selection) {
  return `${selection.conditionId}:${selection.outcomeId}:${selection.gameId}`
}

function doSelectionsMatch(sharedSelections, betSelections) {
  const normalizedSharedSelections = normalizePickShareSelections(sharedSelections)
  const normalizedBetSelections = normalizePickShareSelections(betSelections)

  if (normalizedSharedSelections.length === 0) return false
  if (normalizedSharedSelections.length !== normalizedBetSelections.length) return false

  const betSelectionKeys = new Set(normalizedBetSelections.map(selectionKey))
  return normalizedSharedSelections.every((selection) => betSelectionKeys.has(selectionKey(selection)))
}

export async function createPickShare({ supabaseUrl, serviceRoleKey, sharerWallet, referrerWallet, selections }) {
  const normalizedSharerWallet = normalizeAddress(sharerWallet || referrerWallet)
  const normalizedSelections = normalizePickShareSelections(selections)

  if (!normalizedSharerWallet) {
    return { ok: false, status: 'invalid_sharer_wallet', error: 'Invalid sharer wallet' }
  }

  if (normalizedSelections.length === 0) {
    return { ok: false, status: 'invalid_selections', error: 'Invalid selections' }
  }

  const rows = await supabaseInsert({
    supabaseUrl,
    serviceRoleKey,
    table: 'pick_shares',
    errorMessage: 'Failed to create pick share',
    body: {
      sharer_wallet: normalizedSharerWallet,
      selections: normalizedSelections,
    },
  })

  return {
    ok: true,
    share: mapPickShare(firstRow(rows)),
  }
}

export async function fetchPickShareById({ supabaseUrl, serviceRoleKey, shareId }) {
  const normalizedShareId = normalizeShareId(shareId)
  if (!normalizedShareId) {
    return { ok: false, status: 'invalid_share_id', error: 'Invalid share id' }
  }

  const rows = await supabaseSelect({
    supabaseUrl,
    serviceRoleKey,
    path: `pick_shares?id=eq.${encodeURIComponent(normalizedShareId)}&select=id,sharer_wallet,selections,status,created_at,expires_at`,
    errorMessage: 'Failed to fetch pick share',
  })

  const share = mapPickShare(firstRow(rows))
  if (!share?.id) {
    return { ok: false, status: 'not_found', error: 'Pick share was not found' }
  }

  if (share.status !== 'active') {
    return { ok: false, status: 'inactive', error: 'Pick share is not active', share }
  }

  if (share.expiresAt && Date.parse(share.expiresAt) <= Date.now()) {
    return { ok: false, status: 'expired', error: 'Pick share has expired', share }
  }

  return { ok: true, share }
}

export function validatePickShareBet({
  share,
  bettorWallet,
  txHash,
  bet,
}) {
  const normalizedBettorWallet = normalizeAddress(bettorWallet)
  const normalizedTxHash = normalizeTxHash(txHash)
  const sharerWallet = normalizeAddress(share?.sharerWallet || share?.referrerWallet)

  if (!share?.id || !sharerWallet) {
    return { ok: false, status: 'invalid_share', error: 'Invalid pick share' }
  }

  if (!normalizedBettorWallet) {
    return { ok: false, status: 'invalid_bettor_wallet', error: 'Invalid bettor wallet' }
  }

  if (!normalizedTxHash) {
    return { ok: false, status: 'invalid_tx_hash', error: 'Invalid transaction hash' }
  }

  if (sharerWallet === normalizedBettorWallet) {
    return { ok: false, status: 'self_share', error: 'Self share points are not allowed' }
  }

  if (!doSelectionsMatch(share.selections, bet.selections)) {
    return { ok: false, status: 'selection_mismatch', error: 'Bet selections do not match the shared picks' }
  }

  return {
    ok: true,
    sharerWallet,
    referrerWallet: sharerWallet,
    bettorWallet: normalizedBettorWallet,
    txHash: normalizedTxHash,
  }
}
