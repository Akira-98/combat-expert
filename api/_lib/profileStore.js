import { normalizeAddress } from './env.js'
import { supabaseInsert, supabaseSelect } from './supabase.js'

function mapProfileRow(row, fallbackAddress) {
  return {
    address: normalizeAddress(row?.wallet_address) || fallbackAddress,
    nickname: typeof row?.nickname === 'string' && row.nickname.trim() ? row.nickname : null,
  }
}

export async function fetchProfileByAddress({ supabaseUrl, serviceRoleKey, address }) {
  const rows = await supabaseSelect({
    supabaseUrl,
    serviceRoleKey,
    path: `profiles?wallet_address=eq.${encodeURIComponent(address)}&select=wallet_address,nickname`,
    errorMessage: 'Failed to fetch profile',
  })

  const profile = Array.isArray(rows) ? rows[0] : undefined
  if (!profile) {
    const insertedRows = await supabaseInsert({
      supabaseUrl,
      serviceRoleKey,
      table: 'profiles',
      prefer: 'resolution=merge-duplicates,return=representation',
      errorMessage: 'Failed to create profile',
      body: {
        wallet_address: address,
      },
    })
    return mapProfileRow(Array.isArray(insertedRows) ? insertedRows[0] : undefined, address)
  }

  return mapProfileRow(profile, address)
}

export async function ensureProfilesByAddresses({ supabaseUrl, serviceRoleKey, addresses }) {
  const uniqueAddresses = [...new Set(addresses.map(normalizeAddress).filter(Boolean))]
  if (uniqueAddresses.length === 0) return

  await supabaseInsert({
    supabaseUrl,
    serviceRoleKey,
    table: 'profiles',
    prefer: 'resolution=ignore-duplicates,return=minimal',
    errorMessage: 'Failed to create profiles',
    body: uniqueAddresses.map((address) => ({
      wallet_address: address,
    })),
  })
}

export async function fetchNicknameMapByAddresses({ supabaseUrl, serviceRoleKey, addresses }) {
  const byAddress = new Map()
  const uniqueAddresses = [...new Set(addresses.map(normalizeAddress).filter(Boolean))]
  if (uniqueAddresses.length === 0) return byAddress

  await ensureProfilesByAddresses({ supabaseUrl, serviceRoleKey, addresses: uniqueAddresses })

  const addressList = uniqueAddresses.map((address) => `"${address}"`).join(',')
  const rows = await supabaseSelect({
    supabaseUrl,
    serviceRoleKey,
    path: `profiles?wallet_address=in.(${encodeURIComponent(addressList)})&select=wallet_address,nickname`,
    errorMessage: 'Failed to fetch profiles',
  })

  if (!Array.isArray(rows)) return byAddress

  for (const row of rows) {
    const address = normalizeAddress(row?.wallet_address)
    if (!address) continue
    byAddress.set(address, typeof row?.nickname === 'string' && row.nickname.trim() ? row.nickname : null)
  }

  return byAddress
}

export async function upsertProfileByAddress({ supabaseUrl, serviceRoleKey, address, nickname }) {
  const rows = await supabaseInsert({
    supabaseUrl,
    serviceRoleKey,
    table: 'profiles',
    prefer: 'resolution=merge-duplicates,return=representation',
    errorMessage: 'Failed to save profile',
    body: {
      wallet_address: address,
      nickname,
    },
  })

  const profile = Array.isArray(rows) ? rows[0] : undefined
  return mapProfileRow(profile, address)
}
