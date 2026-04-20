import { h } from './ogImage.js'

export function getParticipantNames(game) {
  if (!Array.isArray(game?.participants)) return []

  return game.participants
    .map((participant) => participant?.name)
    .filter((name) => typeof name === 'string' && name.trim())
}

function getInitials(name) {
  const tokens = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (tokens.length === 0) return '??'

  return tokens
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? '')
    .join('')
}

function slugifyName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function fetchExistingFighterImage(origin, name) {
  const slug = slugifyName(name)
  if (!slug) return undefined

  for (const extension of ['png', 'jpg', 'jpeg', 'webp']) {
    const url = `${origin}/fighters/${slug}.${extension}`

    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (response.ok) return url
    } catch {
      return undefined
    }
  }

  return undefined
}

function FighterPanel({ name, imageUrl, align }) {
  const isRight = align === 'right'

  return h(
    'div',
    {
      style: {
        width: 330,
        height: 360,
        flexDirection: 'column',
        alignItems: isRight ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
      },
    },
    h(
      'div',
      {
        style: {
          width: 230,
          height: 230,
          border: '3px solid #34d399',
          borderRadius: 8,
          overflow: 'hidden',
          background: '#172033',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
      imageUrl
        ? h('img', {
            src: imageUrl,
            style: {
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            },
          })
        : h(
            'div',
            {
              style: {
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f8fafc',
                fontSize: 72,
                fontWeight: 900,
                background: '#111827',
              },
            },
            getInitials(name),
          ),
    ),
    h(
      'div',
      {
        style: {
          marginTop: 22,
          color: '#f8fafc',
          fontSize: 36,
          fontWeight: 800,
          lineHeight: 1.05,
          maxWidth: 320,
          textAlign: isRight ? 'right' : 'left',
        },
      },
      name,
    ),
  )
}

function OddsRow({ label, odds }) {
  return h(
    'div',
    {
      style: {
        height: 58,
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        borderBottom: '1px solid rgba(148, 163, 184, 0.22)',
      },
    },
    h(
      'div',
      {
        style: {
          color: '#e5e7eb',
          fontSize: 25,
          fontWeight: 700,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: 280,
        },
      },
      label,
    ),
    h(
      'div',
      {
        style: {
          color: '#34d399',
          fontSize: 30,
          fontWeight: 900,
        },
      },
      Number(odds).toFixed(2),
    ),
  )
}

export function MarketOgImage({ game, marketPreview, fighterImages }) {
  const participants = getParticipantNames(game)
  const leftName = participants[0] || 'Fighter A'
  const rightName = participants[1] || 'Fighter B'
  const title = game?.title || `${leftName} vs ${rightName}`
  const leagueName = game?.league?.name || 'MMA'
  const startsAt = game?.startsAt ? new Date(game.startsAt) : undefined
  const formattedStart = startsAt && Number.isFinite(startsAt.getTime())
    ? new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'UTC',
        timeZoneName: 'short',
      }).format(startsAt)
    : 'Market is live'
  const odds = marketPreview.outcomes.length > 0
    ? marketPreview.outcomes
    : [
        { selectionName: leftName, odds: 0 },
        { selectionName: rightName, odds: 0 },
      ]

  return h(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        padding: '42px 54px',
        background: '#0b1020',
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
      },
    },
    h(
      'div',
      {
        style: {
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      },
      h(
        'div',
        {
          style: {
            alignItems: 'center',
            gap: 14,
            color: '#f8fafc',
            fontSize: 28,
            fontWeight: 900,
          },
        },
        h(
          'div',
          {
            style: {
              width: 34,
              height: 34,
              borderRadius: 8,
              background: '#34d399',
            },
          },
        ),
        'Combat Expert',
      ),
      h(
        'div',
        {
          style: {
            color: '#94a3b8',
            fontSize: 22,
            fontWeight: 700,
          },
        },
        `${leagueName} · ${formattedStart}`,
      ),
    ),
    h(
      'div',
      {
        style: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 28,
        },
      },
      h(FighterPanel, { name: leftName, imageUrl: fighterImages[0], align: 'left' }),
      h(
        'div',
        {
          style: {
            width: 330,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          },
        },
        h(
          'div',
          {
            style: {
              color: '#f8fafc',
              fontSize: 54,
              fontWeight: 950,
              textAlign: 'center',
              lineHeight: 1,
            },
          },
          'VS',
        ),
        h(
          'div',
          {
            style: {
              marginTop: 24,
              width: 330,
              border: '1px solid rgba(148, 163, 184, 0.35)',
              borderRadius: 8,
              padding: '14px 18px 8px',
              background: 'rgba(15, 23, 42, 0.86)',
              flexDirection: 'column',
            },
          },
          h(
            'div',
            {
              style: {
                color: '#94a3b8',
                fontSize: 20,
                fontWeight: 800,
                marginBottom: 2,
              },
            },
            marketPreview.marketTitle,
          ),
          ...odds.slice(0, 3).map((outcome) =>
            h(OddsRow, {
              key: `${outcome.selectionName}-${outcome.odds}`,
              label: outcome.selectionName,
              odds: outcome.odds,
            }),
          ),
        ),
      ),
      h(FighterPanel, { name: rightName, imageUrl: fighterImages[1], align: 'right' }),
    ),
    h(
      'div',
      {
        style: {
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#94a3b8',
          fontSize: 20,
          fontWeight: 700,
        },
      },
      h('div', null, title),
      h('div', null, 'combatexpert.xyz'),
    ),
  )
}
