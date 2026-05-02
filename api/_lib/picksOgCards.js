import { getParticipantNames } from './marketOgImage.js'
import { h } from './ogImage.js'
import {
  PICKS_OG_COLORS as COLORS,
  formatOdds,
  getInitials,
  getSelectionLabel,
  getShortGameTitle,
  normalizeNameKey,
} from './picksOgHelpers.js'

function FighterFace({ name, imageUrl, size = 132 }) {
  return h(
    'div',
    {
      style: {
        width: size,
        height: size,
        border: '1px solid rgba(244, 247, 251, 0.16)',
        background: 'linear-gradient(180deg, rgba(244, 247, 251, 0.08), rgba(3, 4, 5, 0.88))',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      },
    },
    imageUrl
      ? h('img', {
          alt: '',
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
              background: 'radial-gradient(circle at 35% 28%, rgba(255, 107, 0, 0.28), rgba(17, 24, 33, 0.98))',
              color: COLORS.textStrong,
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: Math.round(size * 0.32),
              fontWeight: 900,
            },
          },
          getInitials(name),
        ),
  )
}

export function PickCard({ selection, game, index, imageUrlByName, variant }) {
  const participants = getParticipantNames(game)
  const leftName = participants[0] || 'Fighter A'
  const rightName = participants[1] || 'Fighter B'
  const isFeature = variant === 'feature'
  const faceSize = isFeature ? 188 : 120
  const cardWidth = isFeature ? 1088 : 532
  const cardHeight = isFeature ? 420 : 220
  const title = getShortGameTitle(selection, game)
  const pickLabel = getSelectionLabel(selection)
  const leftImage = imageUrlByName?.get(normalizeNameKey(leftName))
  const rightImage = imageUrlByName?.get(normalizeNameKey(rightName))

  return h(
    'div',
    {
      style: {
        width: cardWidth,
        height: cardHeight,
        border: '1px solid rgba(244, 247, 251, 0.16)',
        borderRadius: 18,
        padding: isFeature ? 28 : 18,
        background: 'linear-gradient(180deg, rgba(14, 19, 26, 0.98), rgba(6, 8, 11, 0.98))',
        boxShadow: '0 24px 70px -44px rgba(0, 0, 0, 0.95)',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: isFeature ? 22 : 12,
      },
    },
    h(
      'div',
      {
        style: {
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isFeature ? 26 : 14,
        },
      },
      h(FighterFace, { name: leftName, imageUrl: leftImage, size: faceSize }),
      h(
        'div',
        {
          style: {
            flex: 1,
            minWidth: 0,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isFeature ? 12 : 8,
          },
        },
        h(
          'div',
          {
            style: {
              minWidth: isFeature ? 72 : 54,
              height: isFeature ? 44 : 34,
              border: '1px solid rgba(255, 107, 0, 0.42)',
              background: 'rgba(82, 37, 17, 0.9)',
              color: COLORS.accent,
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isFeature ? 24 : 17,
              fontWeight: 900,
            },
          },
          `#${index + 1}`,
        ),
        h(
          'div',
          {
            style: {
              color: COLORS.textStrong,
              fontSize: isFeature ? 42 : 25,
              fontWeight: 900,
              lineHeight: 1.05,
              textAlign: 'center',
              maxWidth: isFeature ? 560 : 270,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: isFeature ? 'normal' : 'nowrap',
            },
          },
          title,
        ),
        h(
          'div',
          {
            style: {
              color: COLORS.textMuted,
              fontSize: isFeature ? 20 : 14,
              fontWeight: 900,
              letterSpacing: 3,
              textTransform: 'uppercase',
            },
          },
          'vs',
        ),
      ),
      h(FighterFace, { name: rightName, imageUrl: rightImage, size: faceSize }),
    ),
    h(
      'div',
      {
        style: {
          minHeight: isFeature ? 76 : 54,
          border: '1px solid rgba(255, 107, 0, 0.28)',
          borderRadius: 12,
          padding: isFeature ? '0 22px' : '0 14px',
          background: 'rgba(82, 37, 17, 0.76)',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
        },
      },
      h(
        'div',
        {
          style: {
            minWidth: 0,
            flexDirection: 'column',
            gap: 4,
          },
        },
        h(
          'div',
          {
            style: {
              color: COLORS.textMuted,
              fontSize: isFeature ? 15 : 11,
              fontWeight: 900,
              letterSpacing: 2,
              textTransform: 'uppercase',
            },
          },
          'Pick',
        ),
        h(
          'div',
          {
            style: {
              color: COLORS.textStrong,
              fontSize: isFeature ? 32 : 21,
              fontWeight: 900,
              maxWidth: isFeature ? 760 : 360,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
          },
          pickLabel,
        ),
      ),
      h(
        'div',
        {
          style: {
            minWidth: isFeature ? 118 : 88,
            height: isFeature ? 54 : 40,
            borderRadius: 999,
            background: COLORS.accent,
            color: '#100804',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isFeature ? 31 : 22,
            fontWeight: 900,
          },
        },
        formatOdds(selection?.odds),
      ),
    ),
  )
}

export function EmptySlip() {
  return h(
    'div',
    {
      style: {
        width: 1088,
        height: 420,
        border: '1px dashed rgba(127, 141, 161, 0.42)',
        borderRadius: 18,
        color: COLORS.textBody,
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 34,
        fontWeight: 900,
      },
    },
    'Shared betslip',
  )
}
