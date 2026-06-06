import { useEffect, useState } from 'react'
import { fetchAffiliateDashboard, type AffiliateDashboard } from '../api/referrals'

export function useAffiliateDashboard({
  address,
  enabled,
}: {
  address?: `0x${string}`
  enabled: boolean
}) {
  const [state, setState] = useState<{
    address?: `0x${string}`
    affiliate?: AffiliateDashboard
  }>({})

  useEffect(() => {
    let isStale = false

    if (!enabled || !address) return

    void fetchAffiliateDashboard(address)
      .then((result) => {
        if (isStale) return
        setState({ address, affiliate: result.ok ? result.affiliate : undefined })
      })
      .catch((error) => {
        if (!isStale) {
          console.warn('Failed to load affiliate dashboard', error)
          setState({ address })
        }
      })

    return () => {
      isStale = true
    }
  }, [address, enabled])

  const affiliate = enabled && address === state.address ? state.affiliate : undefined
  const isLoading = enabled && Boolean(address) && address !== state.address

  return { affiliate, isLoading }
}
