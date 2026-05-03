import { useState } from 'react'

type UseGamesPaneStateParams = {
  leagueOptions: string[]
}

export function useGamesPaneState({ leagueOptions }: UseGamesPaneStateParams) {
  const [isLeagueExpanded, setIsLeagueExpanded] = useState(false)

  return {
    isLeagueExpanded,
    mobileLeagueOptions: isLeagueExpanded ? leagueOptions : leagueOptions.slice(0, 8),
    toggleLeagueExpanded: () => setIsLeagueExpanded((value) => !value),
  }
}
