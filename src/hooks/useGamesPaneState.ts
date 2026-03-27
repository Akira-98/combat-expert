import { useEffect, useState, type FormEvent } from 'react'

type UseGamesPaneStateParams = {
  leagueOptions: string[]
}

export function useGamesPaneState({ leagueOptions }: UseGamesPaneStateParams) {
  const [isLeagueExpanded, setIsLeagueExpanded] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

  useEffect(() => {
    if (!isSearchModalOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSearchModalOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchModalOpen])

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSearchModalOpen(false)
  }

  return {
    isLeagueExpanded,
    isSearchModalOpen,
    mobileLeagueOptions: isLeagueExpanded ? leagueOptions : leagueOptions.slice(0, 8),
    openSearchModal: () => setIsSearchModalOpen(true),
    closeSearchModal: () => setIsSearchModalOpen(false),
    toggleLeagueExpanded: () => setIsLeagueExpanded((value) => !value),
    handleSearchSubmit,
  }
}
