import { h } from './ogImage.js'
import { EmptySlip, PickCard } from './picksOgCards.js'
import {
  PICKS_OG_COLORS as COLORS,
  calculateTotalOdds,
  getGameForSelection,
  getGameId,
  normalizeNameKey,
  shortenWallet,
} from './picksOgHelpers.js'

export function PicksOgImage({ share, games = [], participantImages = [] }) {
  const selections = Array.isArray(share?.selections) ? share.selections : []
  const visibleSelections = selections.slice(0, 4)
  const hiddenCount = Math.max(0, selections.length - visibleSelections.length)
  const gameById = new Map()
  const imageUrlByName = new Map()
  const totalOdds = calculateTotalOdds(selections)
  const slipLabel = `${selections.length || 0}-Pick Slip`
  const wallet = shortenWallet(share?.referrerWallet)

  for (const game of games) {
    const gameId = getGameId(game)
    if (gameId) gameById.set(gameId, game)
  }

  for (const participant of participantImages) {
    if (participant?.name && participant?.imageUrl) {
      imageUrlByName.set(normalizeNameKey(participant.name), participant.imageUrl)
    }
  }

  return h(
    'div',
    {
      style: {
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: `radial-gradient(circle at 15% 15%, rgba(211, 90, 171, 0.22), transparent 26%), radial-gradient(circle at 82% 28%, rgba(122, 168, 255, 0.12), transparent 22%), linear-gradient(135deg, ${COLORS.bg}, #14121d 56%, #06000a)`,
        color: COLORS.textStrong,
        fontFamily: 'Space Grotesk, Noto Sans KR, Segoe UI, Arial, sans-serif',
        flexDirection: 'column',
        padding: '30px 44px 28px',
        gap: 22,
      },
    },
    h(
      'div',
      {
        style: {
          height: 72,
          border: '1px solid rgba(244, 247, 251, 0.12)',
          borderRadius: 18,
          padding: '0 22px',
          background: 'rgba(8, 12, 17, 0.84)',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      },
      h(
        'div',
        {
          style: {
            alignItems: 'center',
            gap: 15,
          },
        },
        h('div', {
          style: {
            width: 30,
            height: 30,
            borderRadius: 999,
            background: COLORS.accent,
            boxShadow: '0 0 0 5px rgba(211, 90, 171, 0.16)',
          },
        }),
        h(
          'div',
          {
            style: {
              color: COLORS.textStrong,
              fontSize: 31,
              fontWeight: 900,
              fontStyle: 'italic',
            },
          },
          'BETAKER Picks',
        ),
      ),
      h(
        'div',
        {
          style: {
            alignItems: 'center',
            gap: 12,
          },
        },
        wallet
          ? h(
              'div',
              {
                style: {
                  color: COLORS.textMuted,
                  fontSize: 17,
                  fontWeight: 900,
                },
              },
              wallet,
            )
          : null,
        h(
          'div',
          {
            style: {
              height: 42,
              borderRadius: 999,
              padding: '0 18px',
              background: 'rgba(36, 17, 31, 0.92)',
              color: COLORS.textStrong,
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 19,
              fontWeight: 900,
            },
          },
          `${slipLabel} · Total ${totalOdds ? `${totalOdds.toFixed(2)}x` : '-'}`,
        ),
      ),
    ),
    h(
      'div',
      {
        style: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 18,
        },
      },
      ...(visibleSelections.length === 0
        ? [h(EmptySlip)]
        : visibleSelections.map((selection, index) => h(PickCard, {
            key: `${selection.conditionId}-${selection.outcomeId}-${index}`,
            selection,
            game: getGameForSelection(selection, gameById),
            index,
            imageUrlByName,
            variant: visibleSelections.length === 1 ? 'feature' : 'compact',
          }))),
    ),
    h(
      'div',
      {
        style: {
          height: 34,
          alignItems: 'center',
          justifyContent: 'space-between',
          color: COLORS.textMuted,
          fontSize: 18,
          fontWeight: 900,
        },
      },
      h('div', {}, 'BETAKER'),
      h('div', {}, hiddenCount > 0 ? `+${hiddenCount} more picks` : 'Shared betslip'),
    ),
  )
}
