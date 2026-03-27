import { useEffect, useState } from 'react'
import { getWalletAvatarUrl } from '../helpers/walletUi'
import { useBodyScrollLock } from './useBodyScrollLock'
import { useI18n } from '../i18n'
import type { useUsdtTransfer } from './useUsdtTransfer'

type UseHeaderControllerParams = {
  address?: `0x${string}`
  isConnected: boolean
  onGuideClick: () => void
  onRankingClick: () => void
  onOpenAuthModal: () => void
  onDisconnect: () => void
  usdtTransfer: ReturnType<typeof useUsdtTransfer>
  usdtBalance?: number
  isUsdtBalanceLoading?: boolean
  isUsdtSupportedChain?: boolean
}

export function useHeaderController({
  address,
  isConnected,
  onGuideClick,
  onRankingClick,
  onOpenAuthModal,
  onDisconnect,
  usdtTransfer,
  usdtBalance,
  isUsdtBalanceLoading,
  isUsdtSupportedChain,
}: UseHeaderControllerParams) {
  const { locale, setLocale, t } = useI18n()
  const [copyLabel, setCopyLabel] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const avatarUrl = getWalletAvatarUrl(address)
  const usdtBalanceLabel = !isUsdtSupportedChain
    ? t('header.unsupportedNetwork')
    : isUsdtBalanceLoading
      ? t('header.balanceLoading')
      : `${(usdtBalance ?? 0).toFixed(4)} USDT`

  useBodyScrollLock(isAccountModalOpen || isTransferModalOpen)

  useEffect(() => {
    if (!isAccountModalOpen && !isTransferModalOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsTransferModalOpen(false)
        setIsAccountModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAccountModalOpen, isTransferModalOpen])

  useEffect(() => {
    if (!isAccountModalOpen && !isTransferModalOpen) return

    void usdtTransfer.refetchBalance()
    const intervalId = window.setInterval(() => {
      void usdtTransfer.refetchBalance()
    }, 15000)

    return () => window.clearInterval(intervalId)
  }, [isAccountModalOpen, isTransferModalOpen, usdtTransfer])

  const closeOverlays = () => {
    setIsTransferModalOpen(false)
    setIsAccountModalOpen(false)
  }

  const handleCopyAddress = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopyLabel('copied')
    } catch {
      setCopyLabel('failed')
    }
    window.setTimeout(() => setCopyLabel('idle'), 1600)
  }

  const handleDisconnect = () => {
    setIsAccountModalOpen(false)
    onDisconnect()
  }

  const handleGuideNavigation = () => {
    closeOverlays()
    onGuideClick()
  }

  const handleRankingNavigation = () => {
    closeOverlays()
    onRankingClick()
  }

  const handleWalletAction = () => {
    setIsAccountModalOpen(false)

    if (!isConnected) {
      onOpenAuthModal()
      return
    }

    setIsTransferModalOpen(true)
  }

  return {
    avatarUrl,
    copyLabel,
    isAccountModalOpen,
    isTransferModalOpen,
    usdtBalanceLabel,
    closeAccountModal: () => setIsAccountModalOpen(false),
    closeTransferModal: () => setIsTransferModalOpen(false),
    handleCopyAddress,
    handleDisconnect,
    handleGuideNavigation,
    handleRankingNavigation,
    handleWalletAction,
    handleToggleAccountModal: () => setIsAccountModalOpen((current) => !current),
    handleToggleLocale: () => setLocale(locale === 'ko' ? 'en' : 'ko'),
  }
}
