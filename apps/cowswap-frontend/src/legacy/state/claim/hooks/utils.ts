import { USDC, GNO, ZERO_PERCENT, ONE_HUNDRED_PERCENT, NATIVE_CURRENCY_BUY_TOKEN } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { CLAIMS_REPO, FREE_CLAIM_TYPES, PAID_CLAIM_TYPES } from './const'
import { ClaimInput, ClaimType, RepoClaims, UserClaims, VCowPrices } from './types'

import { InvestClaim } from '../reducer'
import { EnhancedUserClaimData, InvestmentAmounts } from '../types'

/**
 * Helper function to check whether any claim is an investment option
 *
 * @param claims
 */
export function hasPaidClaim(claims: UserClaims | null): boolean {
  return Boolean(claims?.some((claim) => PAID_CLAIM_TYPES.includes(claim.type)))
}

/**
 * Helper function to check whether any claim is an airdrop option
 *
 * @param claims
 */
export function hasFreeClaim(claims: UserClaims | null): boolean {
  return Boolean(claims?.some((claim) => FREE_CLAIM_TYPES.includes(claim.type)))
}

/**
 * Helper function to transform data as coming from the airdrop claims repo onto internal types
 *
 * Namely, converting types from their string representations to the enum numbers:
 * Airdrop -> 0
 */
export function transformRepoClaimsToUserClaims(repoClaims: RepoClaims): UserClaims {
  return repoClaims.map((claim) => ({ ...claim, type: ClaimType[claim.type] }))
}

/**
 * Helper function to return an array of investment option claims
 *
 * @param claims
 */
export function getPaidClaims(claims: UserClaims): UserClaims {
  return claims?.filter((claim) => PAID_CLAIM_TYPES.includes(claim.type))
}

/**
 * Helper function to return an array of free claims
 *
 * @param claims
 */
export function getFreeClaims(claims: UserClaims): UserClaims {
  return claims?.filter((claim) => FREE_CLAIM_TYPES.includes(claim.type))
}

/**
 * Helper function to check if current type is free claim
 *
 * @param type
 */
export function isFreeClaim(type: ClaimType): boolean {
  return FREE_CLAIM_TYPES.includes(type)
}

/**
 * Helper function to return an array of indexes from claim data
 *
 * @param type
 */
export function getIndexes(data: RepoClaims | UserClaims): number[] {
  return data.map(({ index }) => index)
}

/**
 * Helper function to get the repo path for the corresponding network id
 * Throws when passed an unknown network id
 */
export function getClaimsRepoPath(id: SupportedChainId): string {
  return `${CLAIMS_REPO}${_repoNetworkIdMapping(id)}/`
}

function _repoNetworkIdMapping(id: SupportedChainId): string {
  switch (id) {
    case SupportedChainId.MAINNET:
      return 'mainnet'
    case SupportedChainId.GNOSIS_CHAIN:
      return 'gnosis-chain'
    case SupportedChainId.GOERLI:
      return 'goerli'
    default:
      throw new Error('Network not supported')
  }
}

/**
 * Helper function to get the claim key based on account and chainId
 */
export function getClaimKey(account: string, chainId: number): string {
  return `${chainId}:${account}`
}

export function claimTypeToToken(type: ClaimType, chainId: SupportedChainId) {
  switch (type) {
    case ClaimType.GnoOption:
      return GNO[chainId]
    case ClaimType.Investor:
      return USDC[chainId]
    case ClaimType.UserOption:
      return NATIVE_CURRENCY_BUY_TOKEN[chainId]
    case ClaimType.Advisor:
    case ClaimType.Airdrop:
    case ClaimType.Team:
      return undefined
  }
}

/**
 * Helper function to get vCow price based on claim type and chainId
 */
export function claimTypeToTokenAmount(type: ClaimType, chainId: SupportedChainId, prices: VCowPrices) {
  switch (type) {
    case ClaimType.GnoOption:
      return { token: claimTypeToToken(ClaimType.GnoOption, chainId), amount: prices.gno as string }
    case ClaimType.Investor:
      return { token: claimTypeToToken(ClaimType.Investor, chainId), amount: prices.usdc as string }
    case ClaimType.UserOption:
      return { token: claimTypeToToken(ClaimType.UserOption, chainId), amount: prices.native as string }
    default:
      return undefined
  }
}

/**
 * Helper function to calculate and return the percentage between 2 CurrencyAmount instances
 */
export function calculatePercentage<C1 extends Currency, C2 extends Currency>(
  numerator: CurrencyAmount<C1>,
  denominator: CurrencyAmount<C2>
): Percent {
  let percentage = denominator.equalTo(ZERO_PERCENT)
    ? ZERO_PERCENT
    : new Percent(numerator.quotient, denominator.quotient)
  if (percentage.greaterThan(ONE_HUNDRED_PERCENT)) {
    percentage = ONE_HUNDRED_PERCENT
  }
  return percentage
}

/**
 * Helper function that calculates vCowAmount (in vCOW) and investedAmount (in investing token)
 */
export function calculateInvestmentAmounts(
  claim: Pick<EnhancedUserClaimData, 'isFree' | 'price' | 'currencyAmount' | 'claimAmount'>,
  investedAmount?: string
): InvestmentAmounts {
  const { isFree, price, currencyAmount, claimAmount } = claim

  if (isFree || !investedAmount) {
    // default to 100% when no investment amount is set
    return { vCowAmount: claimAmount, investmentCost: currencyAmount }
  } else if (!currencyAmount || !price) {
    return {}
  }

  const amount = CurrencyAmount.fromRawAmount(currencyAmount.currency, investedAmount)
  return { vCowAmount: price.quote(amount), investmentCost: amount }
}

/**
 * Helper function that prepares investFlowData for claiming by calculating vCowAmount from investedAmounts
 */
export function prepareInvestClaims(
  investFlowData: Record<number, InvestClaim>,
  userClaimData: EnhancedUserClaimData[]
) {
  return Object.values(investFlowData).reduce<ClaimInput[]>((acc, { index, investedAmount }) => {
    const claim = userClaimData.find(({ index: idx }) => idx === index)

    if (claim) {
      const { vCowAmount } = calculateInvestmentAmounts(claim, investedAmount)

      acc.push({ index, amount: vCowAmount?.quotient.toString() })
    }

    return acc
  }, [])
}
