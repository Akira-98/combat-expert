import { print } from 'graphql'
import gql from 'graphql-tag'
import { chainsData, GamesDocument } from '@azuro-org/toolkit'

const GAME_BETS_QUERY = gql`
  query RankingSyncGameBets($first: Int, $skip: Int, $where: V3_Bet_filter!) {
    v3Bets(first: $first, skip: $skip, where: $where, subgraphError: allow) {
      betId
      actor
      result
      status
      odds
      settledOdds
      resolvedBlockTimestamp
      selections {
        odds
        outcome {
          outcomeId
          condition {
            conditionId
            gameId
            wonOutcomeIds
          }
        }
      }
    }
  }
`

const V3_BETS_PAGE_SIZE = 200
const POLYGON_CHAIN_ID = 137

function buildGraphqlUrl(url, variables) {
  const opName = extractOperationName(variables.document)
  const params = new URLSearchParams()

  if (opName) {
    params.append('op', opName)
  }

  if (variables && typeof variables === 'object' && 'limit' in variables) {
    params.append('limit', String(variables.limit))
  }

  if (variables && typeof variables === 'object' && 'offset' in variables) {
    params.append('offset', String(variables.offset))
  }

  return params.size > 0 ? `${url}?${params.toString()}` : url
}

function extractOperationName(document) {
  if (!document?.definitions) return ''

  const operationDefinition = document.definitions.find((definition) => definition.kind === 'OperationDefinition')
  return operationDefinition?.name?.value || ''
}

async function gqlRequest({ url, document, variables }) {
  const response = await fetch(buildGraphqlUrl(url, { ...variables, document }), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/graphql-response+json',
    },
    body: JSON.stringify({
      query: print(document),
      variables,
    }),
    cache: 'no-cache',
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed (${response.status})`)
  }

  const payload = await response.json()
  if (payload?.errors?.length) {
    const firstMessage = payload.errors[0]?.message
    throw new Error(firstMessage || 'GraphQL response contained errors')
  }

  return payload?.data
}

export function getPolygonChainData() {
  return chainsData[POLYGON_CHAIN_ID]
}

export async function fetchGamesByIds(gameIds) {
  if (gameIds.length === 0) return []

  const chainData = getPolygonChainData()
  const data = await gqlRequest({
    url: chainData.graphql.feed,
    document: GamesDocument,
    variables: {
      first: Math.min(gameIds.length, 1000),
      where: {
        gameId_in: gameIds,
      },
    },
  })

  return Array.isArray(data?.games) ? data.games : []
}

export async function fetchSettledV3BetsByGameId(gameId) {
  const chainData = getPolygonChainData()
  const allBets = []
  let skip = 0

  while (true) {
    const data = await gqlRequest({
      url: chainData.graphql.bets,
      document: GAME_BETS_QUERY,
      variables: {
        first: V3_BETS_PAGE_SIZE,
        skip,
        where: {
          _gamesIds_contains: [gameId],
          status_in: ['Resolved', 'Canceled'],
        },
      },
    })

    const page = Array.isArray(data?.v3Bets) ? data.v3Bets : []
    allBets.push(...page)

    if (page.length < V3_BETS_PAGE_SIZE) {
      break
    }

    skip += V3_BETS_PAGE_SIZE
  }

  return allBets
}
