import { useEffect, useRef, useState } from 'react'
import { useBodyScrollLock } from './useBodyScrollLock'

type UseAppLayoutParams = {
  isMobileBetslipOpen: boolean
}

export function useAppLayout({ isMobileBetslipOpen }: UseAppLayoutParams) {
  const [mobileHeaderHeight, setMobileHeaderHeight] = useState(72)
  const mobileHeaderRef = useRef<HTMLDivElement | null>(null)

  useBodyScrollLock(isMobileBetslipOpen)

  useEffect(() => {
    const headerNode = mobileHeaderRef.current
    if (!headerNode) return

    const syncHeaderHeight = () => {
      setMobileHeaderHeight(Math.ceil(headerNode.getBoundingClientRect().height))
    }

    syncHeaderHeight()
    const observer = new ResizeObserver(syncHeaderHeight)
    observer.observe(headerNode)
    window.addEventListener('resize', syncHeaderHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncHeaderHeight)
    }
  }, [])

  return {
    mobileHeaderRef,
    mobileHeaderHeight,
  }
}
