import { useEffect, useState } from 'react'
import { fetchMyReferral, type MyReferral } from '../api/referrals'

export function useMyReferral({
  address,
  isConnected,
}: {
  address?: `0x${string}`
  isConnected: boolean
}) {
  const [state, setState] = useState<{ address?: `0x${string}`; referral?: MyReferral }>({})

  useEffect(() => {
    let isStale = false

    if (!isConnected || !address) return

    void fetchMyReferral(address)
      .then((result) => {
        if (isStale) return
        setState({ address, referral: result.ok ? result.referral : undefined })
      })
      .catch((error) => {
        if (!isStale) {
          console.warn('Failed to load referral', error)
        }
      })

    return () => {
      isStale = true
    }
  }, [address, isConnected])

  const referral = isConnected && address === state.address ? state.referral : undefined

  return { referral }
}
