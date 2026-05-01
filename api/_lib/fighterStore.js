import { supabaseSelect } from './supabase.js'

const FIGHTER_IMAGE_BUCKET = 'fighter-images'

function normalizeAzuroName(value) {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/\s+/g, ' ').slice(0, 160)
}

function encodeSupabaseStoragePath(path) {
  return String(path || '')
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/')
}

function buildPublicFighterImageUrl(supabaseUrl, imagePath) {
  const encodedPath = encodeSupabaseStoragePath(imagePath)
  if (!encodedPath) return null

  return `${supabaseUrl}/storage/v1/object/public/${FIGHTER_IMAGE_BUCKET}/${encodedPath}`
}

function quotePostgrestValue(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

export function normalizeFighterNames(values) {
  const names = Array.isArray(values) ? values : [values]
  return [...new Set(names.map(normalizeAzuroName).filter(Boolean))].slice(0, 20)
}

export function mapFighterRow(row, supabaseUrl) {
  const azuroName = normalizeAzuroName(row?.azuro_name)
  if (!azuroName) return null

  const imagePath = typeof row?.image_path === 'string' && row.image_path.trim()
    ? row.image_path.trim()
    : null

  return {
    azuroName,
    imagePath,
    imageUrl: imagePath ? buildPublicFighterImageUrl(supabaseUrl, imagePath) : null,
  }
}

export async function fetchFightersByAzuroNames({ supabaseUrl, serviceRoleKey, names }) {
  const normalizedNames = normalizeFighterNames(names)
  if (normalizedNames.length === 0) return []

  const nameList = normalizedNames.map(quotePostgrestValue).join(',')
  const rows = await supabaseSelect({
    supabaseUrl,
    serviceRoleKey,
    path: `fighters?azuro_name=in.(${encodeURIComponent(nameList)})&select=azuro_name,image_path`,
    errorMessage: 'Failed to fetch fighters',
  })

  return Array.isArray(rows)
    ? rows.map((row) => mapFighterRow(row, supabaseUrl)).filter(Boolean)
    : []
}
