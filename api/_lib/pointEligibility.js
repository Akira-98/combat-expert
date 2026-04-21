import { fetchV3BetsByCreatedTxHash } from './azuro.js'
import { normalizeAddress, normalizeTxHash } from './env.js'

function mapBetClaimBet(rawBet) {
  return {
    betId: typeof rawBet?.betId === 'string' ? rawBet.betId : '',
    bettor: normalizeAddress(rawBet?.bettor),
    actor: normalizeAddress(rawBet?.actor),
    owner: normalizeAddress(rawBet?.owner),
    affiliate: normalizeAddress(rawBet?.affiliate),
    amount: typeof rawBet?.amount === 'string' ? rawBet.amount : String(rawBet?.amount ?? ''),
    odds: typeof rawBet?.odds === 'string' ? rawBet.odds : String(rawBet?.odds ?? ''),
    status: typeof rawBet?.status === 'string' ? rawBet.status : '',
    result: typeof rawBet?.result === 'string' ? rawBet.result : '',
    createdTxHash: normalizeTxHash(rawBet?.createdTxHash),
    createdBlockTimestamp: typeof rawBet?.createdBlockTimestamp === 'string' ? rawBet.createdBlockTimestamp : String(rawBet?.createdBlockTimestamp ?? ''),
  }
}

function isWalletRelatedToBet(bet, walletAddress) {
  return bet.bettor === walletAddress || bet.actor === walletAddress || bet.owner === walletAddress
}

export async function verifyFrontendBetClaim({ txHash, walletAddress, affiliateAddress }) {
  const normalizedTxHash = normalizeTxHash(txHash)
  const normalizedWalletAddress = normalizeAddress(walletAddress)
  const normalizedAffiliateAddress = normalizeAddress(affiliateAddress)

  if (!normalizedTxHash) {
    return { eligible: false, status: 'invalid_tx_hash', reason: 'Invalid transaction hash' }
  }

  if (!normalizedWalletAddress) {
    return { eligible: false, status: 'invalid_wallet_address', reason: 'Invalid wallet address' }
  }

  if (!normalizedAffiliateAddress) {
    return { eligible: false, status: 'missing_affiliate', reason: 'Affiliate address is not configured' }
  }

  const bets = (await fetchV3BetsByCreatedTxHash(normalizedTxHash)).map(mapBetClaimBet)
  if (bets.length === 0) {
    return {
      eligible: false,
      status: 'pending_indexing',
      reason: 'Bet was not found in the Azuro subgraph yet',
      txHash: normalizedTxHash,
    }
  }

  const matchingWalletBets = bets.filter((bet) => isWalletRelatedToBet(bet, normalizedWalletAddress))
  if (matchingWalletBets.length === 0) {
    return {
      eligible: false,
      status: 'wallet_mismatch',
      reason: 'No bet in this transaction belongs to the requested wallet',
      txHash: normalizedTxHash,
      bets,
    }
  }

  const eligibleBet = matchingWalletBets.find((bet) => bet.affiliate === normalizedAffiliateAddress)
  if (!eligibleBet) {
    return {
      eligible: false,
      status: 'affiliate_mismatch',
      reason: 'Bet was not placed through this frontend affiliate',
      txHash: normalizedTxHash,
      expectedAffiliate: normalizedAffiliateAddress,
      bets: matchingWalletBets,
    }
  }

  return {
    eligible: true,
    status: 'eligible',
    txHash: normalizedTxHash,
    walletAddress: normalizedWalletAddress,
    affiliateAddress: normalizedAffiliateAddress,
    bet: eligibleBet,
  }
}
