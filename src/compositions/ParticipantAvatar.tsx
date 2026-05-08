import { useState } from 'react'
import type { GameParticipantItem } from '../types/ui'

type ParticipantAvatarProps = {
  participant?: GameParticipantItem
  className?: string
}

export function ParticipantAvatar({
  participant,
  className = 'h-8 w-8 text-[11px]',
}: ParticipantAvatarProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string>()
  const imageUrl = participant?.image ?? undefined
  const shouldShowImage = Boolean(imageUrl) && failedImageUrl !== imageUrl
  const initials = getParticipantInitials(participant?.name)

  return (
    <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10 font-black text-white/80 ${className}`}>
      {shouldShowImage ? (
        <img
          alt={participant?.name ?? ''}
          className="h-full w-full object-cover"
          src={imageUrl}
          onError={() => setFailedImageUrl(imageUrl)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </span>
  )
}

function getParticipantInitials(name?: string) {
  const tokens = (name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (tokens.length === 0) return '?'

  return tokens
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? '')
    .join('')
}
