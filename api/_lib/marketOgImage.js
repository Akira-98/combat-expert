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

const COLORS = {
  bg: '#000000',
  surface: '#0b0f14',
  surfaceSoft: '#0f141c',
  border: '#1f2937',
  textStrong: '#e6eef8',
  textBody: '#b5c2d2',
  textMuted: '#8090a4',
  accent: '#ff6b00',
  accentSoft: '#3a2519',
}

function formatOdds(odds) {
  const value = Number(odds)
  return Number.isFinite(value) && value > 0 ? value.toFixed(2) : '-'
}

function FighterBadge({ name, align }) {
  const isRight = align === 'right'

  return h(
    'div',
    {
      style: {
        width: 250,
        flexDirection: 'column',
        alignItems: isRight ? 'flex-end' : 'flex-start',
        justifyContent: 'flex-start',
      },
    },
    h(
      'div',
      {
        style: {
          width: 156,
          height: 156,
          border: '1px solid rgba(230, 238, 248, 0.12)',
          borderRadius: 999,
          padding: 10,
          background: 'radial-gradient(circle at 30% 30%, rgba(230, 238, 248, 0.15), rgba(230, 238, 248, 0.03) 58%, rgba(0, 0, 0, 0.25))',
          boxShadow: '0 20px 34px -24px rgba(0, 0, 0, 0.9)',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
      h(
        'div',
        {
          style: {
            width: '100%',
            height: '100%',
            border: '1px solid rgba(255, 107, 0, 0.24)',
            borderRadius: 999,
            background: `linear-gradient(180deg, rgba(255, 107, 0, 0.22), ${COLORS.surface})`,
            alignItems: 'center',
            justifyContent: 'center',
          },
        },
        h(
          'div',
          {
            style: {
              color: COLORS.textStrong,
              fontSize: 48,
              fontWeight: 900,
              letterSpacing: 5,
              paddingLeft: 5,
            },
          },
          getInitials(name),
        ),
      ),
    ),
  )
}

function OutcomeTile({ label, odds }) {
  return h(
    'div',
    {
      style: {
        height: 76,
        border: '1px solid rgba(31, 41, 55, 0.86)',
        borderRadius: 12,
        padding: '0 22px',
        background: 'rgba(15, 20, 28, 0.92)',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 18,
      },
    },
    h(
      'div',
      {
        style: {
          color: COLORS.textStrong,
          fontSize: 25,
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: 330,
        },
      },
      label,
    ),
    h(
      'div',
      {
        style: {
          color: COLORS.textStrong,
          fontSize: 28,
          fontWeight: 900,
        },
      },
      formatOdds(odds),
    ),
  )
}

export function MarketOgImage({ game, marketPreview }) {
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
  const odds = Array.isArray(marketPreview?.outcomes) && marketPreview.outcomes.length > 0
    ? marketPreview.outcomes
    : [
        { selectionName: leftName, odds: 0 },
        { selectionName: rightName, odds: 0 },
      ]
  const visibleOdds = odds.slice(0, 2)
  const marketTitle = marketPreview?.marketTitle || 'Winner'

  return h(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        padding: '38px 44px 34px',
        background: COLORS.bg,
        color: COLORS.textStrong,
        fontFamily: 'Space Grotesk, Noto Sans KR, Segoe UI, Arial, sans-serif',
      },
    },
    h(
      'div',
      {
        style: {
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 58,
        },
      },
      h(
        'div',
        {
          style: {
            alignItems: 'center',
            gap: 16,
            color: COLORS.textStrong,
            fontSize: 34,
            fontWeight: 900,
            fontStyle: 'italic',
            letterSpacing: 0.8,
          },
        },
        h(
          'div',
          {
            style: {
              width: 36,
              height: 36,
              borderRadius: 999,
              background: COLORS.accent,
              boxShadow: '0 0 0 5px rgba(255, 107, 0, 0.14)',
            },
          },
        ),
        'Combat Expert',
      ),
      h(
        'div',
        {
          style: {
            color: COLORS.textMuted,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 3,
            textTransform: 'uppercase',
          },
        },
        'Market Share',
      ),
    ),
    h(
      'div',
      {
        style: {
          height: 260,
          marginTop: 20,
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 34,
        },
      },
      h(FighterBadge, { name: leftName, align: 'left' }),
      h(
        'div',
        {
          style: {
            width: 520,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          },
        },
        h(
          'div',
          {
            style: {
              color: COLORS.textMuted,
              fontSize: 21,
              fontWeight: 800,
              letterSpacing: 8,
              textTransform: 'uppercase',
            },
          },
          leagueName,
        ),
        h(
          'div',
          {
            style: {
              marginTop: 22,
              color: COLORS.textStrong,
              fontSize: 42,
              fontWeight: 700,
              textAlign: 'center',
              lineHeight: 1,
            },
          },
          formattedStart,
        ),
        h(
          'div',
          {
            style: {
              marginTop: 30,
              color: COLORS.textStrong,
              fontSize: 30,
              fontWeight: 700,
              lineHeight: 1.18,
              textAlign: 'center',
              maxWidth: 520,
            },
          },
          `${leftName} - ${rightName}`,
        ),
      ),
      h(FighterBadge, { name: rightName, align: 'right' }),
    ),
    h(
      'div',
      {
        style: {
          border: '1px solid rgba(31, 41, 55, 1)',
          borderRadius: 20,
          padding: 28,
          background: 'rgba(11, 15, 20, 0.98)',
          boxShadow: '0 12px 28px -20px rgba(0, 0, 0, 0.8)',
          flexDirection: 'column',
        },
      },
      h(
        'div',
        {
          style: {
            marginBottom: 22,
            alignItems: 'center',
            justifyContent: 'space-between',
          },
        },
        h(
          'div',
          {
            style: {
              color: COLORS.textStrong,
              fontSize: 28,
              fontWeight: 800,
            },
          },
          marketTitle,
        ),
        h(
          'div',
          {
            style: {
              minWidth: 42,
              height: 42,
              border: '1px solid rgba(31, 41, 55, 0.9)',
              borderRadius: 999,
              color: COLORS.textBody,
              background: COLORS.surfaceSoft,
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 800,
            },
          },
          String(visibleOdds.length),
        ),
      ),
      h(
        'div',
        {
          style: {
            display: 'flex',
            gap: 16,
          },
        },
        ...visibleOdds.map((outcome) =>
          h(
            'div',
            {
              key: `${outcome.selectionName}-${outcome.odds}`,
              style: {
                flex: 1,
                minWidth: 0,
              },
            },
            h(OutcomeTile, {
              label: outcome.selectionName,
              odds: outcome.odds,
            }),
          ),
        ),
      ),
    ),
    h(
      'div',
      {
        style: {
          marginTop: 'auto',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: COLORS.textMuted,
          fontSize: 18,
          fontWeight: 800,
        },
      },
      h('div', null, title),
      h(
        'div',
        {
          style: {
            alignItems: 'center',
            gap: 10,
          },
        },
        h(
          'div',
          {
            style: {
              width: 16,
              height: 16,
              borderRadius: 999,
              background: COLORS.accent,
            },
          },
        ),
        'combatexpert.xyz',
      ),
    ),
  )
}
