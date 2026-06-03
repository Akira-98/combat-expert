import { useEffect, useRef } from 'react'
import { attributeReferral } from '../api/referrals'

const REFERRAL_CODE_STORAGE_KEY = 'combat.referralCode'
const ATTRIBUTED_WALLET_STORAGE_PREFIX = 'combat.referralAttributed.'
const REFERRAL_CODE_PATTERN = /^[A-Z2-9]{6,12}$/

function normalizeReferralCode(value: string | null | undefined) {
  const normalized = String(value || '').trim().toUpperCase()
  return REFERRAL_CODE_PATTERN.test(normalized) ? normalized : ''
}

function normalizeWalletAddress(value: string | undefined) {
  const normalized = String(value || '').trim().toLowerCase()
  return /^0x[a-f0-9]{40}$/.test(normalized) ? normalized : ''
}

function storeReferralCodeFromUrl() {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  const referralCode = normalizeReferralCode(url.searchParams.get('ref'))
  if (!referralCode) return

  window.localStorage.setItem(REFERRAL_CODE_STORAGE_KEY, referralCode)
  url.searchParams.delete('ref')
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
}

function getStoredReferralCode() {
  if (typeof window === 'undefined') return ''
  return normalizeReferralCode(window.localStorage.getItem(REFERRAL_CODE_STORAGE_KEY))
}

function getAttributedWalletStorageKey(walletAddress: string) {
  return `${ATTRIBUTED_WALLET_STORAGE_PREFIX}${walletAddress}`
}

export function useReferralAttribution({
  address,
  isConnected,
}: {
  address?: string
  isConnected: boolean
}) {
  const attemptedKeyRef = useRef('')

  useEffect(() => {
    storeReferralCodeFromUrl()
  }, [])

  useEffect(() => {
    if (!isConnected || typeof window === 'undefined') return

    const referredWallet = normalizeWalletAddress(address)
    if (!referredWallet) return

    const code = getStoredReferralCode()
    if (!code) return

    const attributedWalletStorageKey = getAttributedWalletStorageKey(referredWallet)
    if (window.localStorage.getItem(attributedWalletStorageKey)) {
      window.localStorage.removeItem(REFERRAL_CODE_STORAGE_KEY)
      return
    }

    const attemptKey = `${code}:${referredWallet}`
    if (attemptedKeyRef.current === attemptKey) return
    attemptedKeyRef.current = attemptKey

    void attributeReferral({ code, referredWallet })
      .then((result) => {
        if (result.ok) {
          window.localStorage.setItem(attributedWalletStorageKey, result.status || 'attributed')
          window.localStorage.removeItem(REFERRAL_CODE_STORAGE_KEY)
        }
      })
      .catch((error) => {
        console.warn('Failed to attribute referral', error)
      })
  }, [address, isConnected])
}
