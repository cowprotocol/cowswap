import { useMemo } from 'react'
import JSBI from 'jsbi'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { useUserClaims } from 'state/claim/hooks/hooksMod'
import { useVCowContract } from 'hooks/useContract'
import { useSingleContractMultipleData } from 'state/multicall/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { V_COW } from 'constants/tokens'

export * from './hooksMod'

export type ClaimType =
  | 'Airdrop' // free, no vesting, can be available on both mainnet and gchain
  | 'Team' // free, with vesting, only on mainnet
  | 'Advisor' // free, with vesting, only on mainnet
  | 'GnoOption' // paid, with vesting, must use GNO, can be available on both mainnet and gchain
  | 'UserOption' // paid, with vesting, must use Native currency, can be available on both mainnet and gchain
  | 'Investor' // paid, with vesting, must use USDC, only on mainnet

export const FREE_CLAIM_TYPES: ClaimType[] = ['Airdrop', 'Team', 'Advisor']
export const PAID_CLAIM_TYPES: ClaimType[] = ['GnoOption', 'UserOption', 'Investor']

export interface UserClaimData {
  index: number
  amount: string
  proof: string[]
  type: ClaimType
}

type Account = string | null | undefined

export type UserClaims = UserClaimData[]

/**
 * Gets an array of available claim
 *
 * @param account
 */
export function useUserAvailableClaims(account: Account): UserClaims {
  const userClaims = useUserClaims(account)
  const contract = useVCowContract()

  // build list of parameters, with the claim index
  const claimIndexes = userClaims?.map(({ index }) => [index]) || []

  const results = useSingleContractMultipleData(contract, 'isClaimed', claimIndexes)

  console.log(`useUserAvailableClaims::re-render`, userClaims, claimIndexes, results)

  return useMemo(() => {
    if (!userClaims || userClaims.length === 0) {
      // user has no claims
      return []
    }

    return results.reduce<UserClaims>((acc, result, index) => {
      if (
        result.valid && // result is valid
        !result.loading && // result is not loading
        result.result?.[0] === false // result is false, meaning not claimed
      ) {
        acc.push(userClaims[index]) // get the claim not yet claimed
      }
      return acc
    }, [])
  }, [results, userClaims])
}

/**
 * Returns whether the user has any available claim
 * Syntactic sugar on top of `useUserAvailableClaims`
 *
 * @param account
 */
export function useUserHasAvailableClaim(account: Account): boolean {
  const availableClaims = useUserAvailableClaims(account)

  return availableClaims.length > 0
}

export function useUserUnclaimedAmount(account: string | null | undefined): CurrencyAmount<Token> | undefined {
  const { chainId } = useActiveWeb3React()
  const claims = useUserAvailableClaims(account)

  const vCow = chainId ? V_COW[chainId] : undefined
  if (!vCow) return undefined
  if (!claims || claims.length === 0) {
    return CurrencyAmount.fromRawAmount(vCow, JSBI.BigInt(0))
  }
  const totalAmount = claims.reduce((acc, claim) => {
    return JSBI.add(acc, JSBI.BigInt(claim.amount))
  }, JSBI.BigInt('0'))

  return CurrencyAmount.fromRawAmount(vCow, JSBI.BigInt(totalAmount))
}
