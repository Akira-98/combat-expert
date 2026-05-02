import { getParticipantNames } from './marketOgImage.js'
import { h } from './ogImage.js'

const COLORS = {
  bg: '#030405',
  surface: '#0b0f14',
  surfaceSoft: '#111821',
  border: '#243040',
  textStrong: '#f4f7fb',
  textBody: '#c7d0dd',
  textMuted: '#7f8da1',
  accent: '#ff6b00',
  accentDark: '#522511',
  green: '#44d07b',
}

function shortenWallet(wallet) {
  const value = String(wallet || '').trim()
  return value.length >= 12 ? `${value.slice(0, 6)}...${value.slice(-4)}` : 'Combat Expert'
}

function formatOdds(odds) {
  const value = Number(odds)
  return Number.isFinite(value) && value > 0 ? value.toFixed(2) : '-'
}

function getSelectionLabel(selection) {
  return selection?.label || selection?.selectionName || 'Pick'
}

function getGameTitle(selection, game) {
  if (selection?.gameTitle) return selection.gameTitle

  const participantTitle = getParticipantNames(game).join(' vs ')
  return participantTitle || 'MMA Market'
}

function getInitials(name) {
  const tokens = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return '?'
  return tokens.slice(0, 2).map((token) => token[0]?.toUpperCase() || '').join('')
}

function FighterPoster({ name, imageUrl, align }) {
  const isRight = align === 'right'

  return h(
    'div',
    {
      style: {
        position: 'absolute',
        top: 86,
        [isRight ? 'right' : 'left']: -18,
        width: 300,
        height: 430,
        alignItems: 'flex-end',
        justifyContent: 'center',
        opacity: imageUrl ? 0.92 : 0.7,
      },
    },
    imageUrl
      ? h('img', {
          alt: '',
          src: imageUrl,
          style: {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: isRight ? 'right bottom' : 'left bottom',
          },
        })
      : h(
          'div',
          {
            style: {
              width: 168,
              height: 168,
              borderRadius: 999,
              border: '1px solid rgba(255, 107, 0, 0.28)',
              background: 'linear-gradient(180deg, rgba(255, 107, 0, 0.2), rgba(17, 24, 33, 0.96))',
              color: COLORS.textStrong,
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 50,
              fontWeight: 900,
            },
          },
          getInitials(name),
        ),
  )
}

function PickRow({ selection, game, index }) {
  return h(
    'div',
    {
      style: {
        minHeight: 72,
        border: '1px solid rgba(36, 48, 64, 0.92)',
        borderRadius: 12,
        padding: '12px 14px',
        background: 'rgba(17, 24, 33, 0.98)',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 5,
      },
    },
    h(
      'div',
      {
        style: {
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
        },
      },
      h(
        'div',
        {
          style: {
            color: COLORS.textStrong,
            fontSize: 25,
            fontWeight: 900,
            lineHeight: 1.05,
            maxWidth: 285,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        },
        getSelectionLabel(selection),
      ),
      h(
        'div',
        {
          style: {
            minWidth: 78,
            height: 38,
            borderRadius: 999,
            background: COLORS.accent,
            color: '#100804',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 23,
            fontWeight: 900,
          },
        },
        formatOdds(selection?.odds),
      ),
    ),
    h(
      'div',
      {
        style: {
          color: COLORS.textMuted,
          fontSize: 15,
          fontWeight: 700,
          lineHeight: 1,
          maxWidth: 370,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      },
      `${index + 1}. ${getGameTitle(selection, game)}`,
    ),
  )
}

function calculateTotalOdds(selections) {
  const odds = selections.map((selection) => Number(selection?.odds)).filter((value) => Number.isFinite(value) && value > 0)
  if (odds.length !== selections.length || odds.length === 0) return undefined

  return odds.reduce((total, value) => total * value, 1)
}

export function PicksOgImage({ share, game, fighterImages = [] }) {
  const selections = Array.isArray(share?.selections) ? share.selections : []
  const visibleSelections = selections.slice(0, 4)
  const hiddenCount = Math.max(0, selections.length - visibleSelections.length)
  const participants = getParticipantNames(game)
  const totalOdds = calculateTotalOdds(selections)
  const slipLabel = `${selections.length || 0}-Pick Slip`
  const referrerLabel = `${shortenWallet(share?.referrerWallet)}'s Picks`

  return h(
    'div',
    {
      style: {
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: `radial-gradient(circle at 20% 34%, rgba(255, 107, 0, 0.24), transparent 28%), linear-gradient(135deg, ${COLORS.bg}, #0b1119 58%, #060708)`,
        color: COLORS.textStrong,
        fontFamily: 'Space Grotesk, Noto Sans KR, Segoe UI, Arial, sans-serif',
      },
    },
    h(FighterPoster, { name: participants[0], imageUrl: fighterImages[0], align: 'left' }),
    h(FighterPoster, { name: participants[1], imageUrl: fighterImages[1], align: 'right' }),
    h(
      'div',
      {
        style: {
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(3, 4, 5, 0.82), rgba(3, 4, 5, 0.22) 36%, rgba(3, 4, 5, 0.72))',
        },
      },
    ),
    h(
      'div',
      {
        style: {
          position: 'relative',
          width: '100%',
          height: '100%',
          padding: '38px 48px 34px',
          justifyContent: 'space-between',
          gap: 44,
        },
      },
      h(
        'div',
        {
          style: {
            width: 520,
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        },
        h(
          'div',
          {
            style: {
              flexDirection: 'column',
              gap: 28,
            },
          },
          h(
            'div',
            {
              style: {
                alignItems: 'center',
                gap: 15,
                color: COLORS.textStrong,
                fontSize: 34,
                fontWeight: 900,
                fontStyle: 'italic',
              },
            },
            h('div', {
              style: {
                width: 34,
                height: 34,
                borderRadius: 999,
                background: COLORS.accent,
                boxShadow: '0 0 0 5px rgba(255, 107, 0, 0.16)',
              },
            }),
            'Combat Expert',
          ),
          h(
            'div',
            {
              style: {
                flexDirection: 'column',
                gap: 16,
              },
            },
            h(
              'div',
              {
                style: {
                  color: COLORS.accent,
                  fontSize: 23,
                  fontWeight: 900,
                  letterSpacing: 4,
                  textTransform: 'uppercase',
                },
              },
              referrerLabel,
            ),
            h(
              'div',
              {
                style: {
                  color: COLORS.textStrong,
                  fontSize: 70,
                  fontWeight: 900,
                  lineHeight: 0.92,
                },
              },
              'Tail This Slip',
            ),
            h(
              'div',
              {
                style: {
                  color: COLORS.textBody,
                  fontSize: 25,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  maxWidth: 430,
                },
              },
              'Open the picks, review the odds, and place the same betslip.',
            ),
          ),
        ),
        h(
          'div',
          {
            style: {
              alignItems: 'center',
              gap: 14,
              color: COLORS.textMuted,
              fontSize: 20,
              fontWeight: 800,
            },
          },
          h('div', {
            style: {
              width: 15,
              height: 15,
              borderRadius: 999,
              background: COLORS.green,
            },
          }),
          'combatexpert.xyz',
        ),
      ),
      h(
        'div',
        {
          style: {
            width: 470,
            height: 548,
            border: '1px solid rgba(244, 247, 251, 0.14)',
            borderRadius: 24,
            padding: 22,
            background: 'rgba(8, 12, 17, 0.96)',
            boxShadow: '0 26px 60px -34px rgba(0, 0, 0, 0.95)',
            flexDirection: 'column',
            gap: 16,
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
                flexDirection: 'column',
                gap: 6,
              },
            },
            h(
              'div',
              {
                style: {
                  color: COLORS.textStrong,
                  fontSize: 32,
                  fontWeight: 900,
                },
              },
              slipLabel,
            ),
            h(
              'div',
              {
                style: {
                  color: COLORS.textMuted,
                  fontSize: 17,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                },
              },
              'Shared betslip',
            ),
          ),
          h(
            'div',
            {
              style: {
                minWidth: 112,
                height: 58,
                border: '1px solid rgba(255, 107, 0, 0.28)',
                borderRadius: 15,
                background: COLORS.accentDark,
                color: COLORS.textStrong,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              },
            },
            h('div', { style: { color: COLORS.textMuted, fontSize: 13, fontWeight: 900 } }, 'TOTAL'),
            h('div', { style: { fontSize: 25, fontWeight: 900 } }, totalOdds ? `${totalOdds.toFixed(2)}x` : '-'),
          ),
        ),
        ...visibleSelections.map((selection, index) => h(PickRow, {
          key: `${selection.conditionId}-${selection.outcomeId}`,
          selection,
          game: selection.gameId === game?.gameId || selection.gameId === game?.id ? game : undefined,
          index,
        })),
        ...(
          hiddenCount > 0
            ? [
                h(
                  'div',
                  {
                    style: {
                      height: 52,
                      border: '1px dashed rgba(127, 141, 161, 0.45)',
                      borderRadius: 12,
                      color: COLORS.textBody,
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 21,
                      fontWeight: 900,
                    },
                  },
                  `+${hiddenCount} more`,
                ),
              ]
            : []
        ),
      ),
    ),
  )
}
