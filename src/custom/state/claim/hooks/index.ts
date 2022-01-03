import { useCallback, useEffect, useMemo, useState } from 'react'
import JSBI from 'jsbi'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { TransactionResponse } from '@ethersproject/providers'

import { VCow as VCowType } from 'abis/types'

import { useVCowContract } from 'hooks/useContract'
import { useActiveWeb3React } from 'hooks/web3'
import { useSingleContractMultipleData } from 'state/multicall/hooks'
import { useTransactionAdder } from 'state/enhancedTransactions/hooks'

import { V_COW } from 'constants/tokens'

import { formatSmart } from 'utils/format'
import { calculateGasMargin } from 'utils/calculateGasMargin'

import { fetchClaims } from 'state/claim/hooks/hooksMod'

export * from './hooksMod'

// TODO: replace with real repo when known
export const CLAIMS_REPO = 'https://raw.githubusercontent.com/gnosis/cow-mrkl-drop-data-chunks/final/chunks/'

export enum ClaimType {
  Airdrop, // free, no vesting, can be available on both mainnet and gchain
  GnoOption, // paid, with vesting, must use GNO, can be available on both mainnet and gchain
  UserOption, // paid, with vesting, must use Native currency, can be available on both mainnet and gchain
  Investor, // paid, with vesting, must use USDC, only on mainnet
  Team, // free, with vesting, only on mainnet
  Advisor, // free, with vesting, only on mainnet
}

type RepoClaimType = keyof typeof ClaimType

export const FREE_CLAIM_TYPES: ClaimType[] = [ClaimType.Airdrop, ClaimType.Team, ClaimType.Advisor]
export const PAID_CLAIM_TYPES: ClaimType[] = [ClaimType.GnoOption, ClaimType.UserOption, ClaimType.Investor]

export interface UserClaimData {
  index: number
  amount: string
  proof: string[]
  type: ClaimType
}

export type RepoClaimData = Omit<UserClaimData, 'type'> & {
  type: RepoClaimType
}

export interface ClaimInput {
  /**
   * The index of the claim
   */
  index: number
  /**
   * The amount of the claim. Optional
   * If not present, will claim the full amount
   */
  amount?: string
}

type Account = string | null | undefined

export type UserClaims = UserClaimData[]
export type RepoClaims = RepoClaimData[]

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

/**
 * Gets user claims from claim repo
 * Stores fetched claims in local state
 *
 * @param account
 */
export function useUserClaims(account: Account): UserClaims | null {
  const { chainId } = useActiveWeb3React()
  const [claimInfo, setClaimInfo] = useState<{ [account: string]: UserClaims | null }>({})

  // We'll have claims on multiple networks
  const claimKey = chainId && account && `${chainId}:${account}`

  useEffect(() => {
    if (!claimKey) {
      return
    }

    fetchClaims(account)
      .then((accountClaimInfo) =>
        setClaimInfo((claimInfo) => {
          return {
            ...claimInfo,
            [claimKey]: accountClaimInfo,
          }
        })
      )
      .catch(() => {
        setClaimInfo((claimInfo) => {
          return {
            ...claimInfo,
            [claimKey]: null,
          }
        })
      })
  }, [account, chainId, claimKey])

  return claimKey ? claimInfo[claimKey] : null
}

/**
 * Hook that returns the claimCallback
 *
 * Different from the original version, the returned callback takes as input a list of ClaimInputs,
 * which is an object of the claim index and the amount being claimed.
 *
 * @param account
 */
export function useClaimCallback(account: string | null | undefined): {
  claimCallback: (claimInputs: ClaimInput[]) => Promise<string | undefined>
} {
  // get claim data for given account
  const { chainId, account: connectedAccount } = useActiveWeb3React()
  const claims = useUserAvailableClaims(account)
  const vCowContract = useVCowContract()

  // used for popup summary
  const addTransaction = useTransactionAdder()
  const vCowToken = chainId ? V_COW[chainId] : undefined

  const claimCallback = useCallback(
    async function (claimInput: ClaimInput[]) {
      if (
        claims.length === 0 ||
        claimInput.length === 0 ||
        !account ||
        !connectedAccount ||
        !chainId ||
        !vCowContract ||
        !vCowToken
      ) {
        throw new Error("Not initialized, can't claim")
      }

      const { args, totalClaimedAmount } = _getClaimManyArgs({ claimInput, claims, account, connectedAccount })

      if (!args) {
        throw new Error('There were no valid claims selected')
      }

      const vCowAmount = CurrencyAmount.fromRawAmount(vCowToken, totalClaimedAmount)

      return vCowContract.estimateGas['claimMany'](...args).then((estimatedGas) => {
        // Last item in the array contains the call overrides
        args[args.length - 1] = {
          ...args[args.length - 1], // add back whatever is already there
          from: connectedAccount, // add the `from` as the connected account
          gasLimit: calculateGasMargin(chainId, estimatedGas), // add the estimated gas limit
        }

        return vCowContract.claimMany(...args).then((response: TransactionResponse) => {
          addTransaction({
            hash: response.hash,
            summary: `Claimed ${formatSmart(vCowAmount)} vCOW`,
            claim: { recipient: account },
          })
          return response.hash
        })
      })
    },
    [account, addTransaction, chainId, claims, connectedAccount, vCowContract, vCowToken]
  )

  return { claimCallback }
}

type GetClaimManyArgsParams = {
  claimInput: ClaimInput[]
  claims: UserClaims
  account: string
  connectedAccount: string
}

type ClaimManyFnArgs = Parameters<VCowType['claimMany']>

type GetClaimManyArgsResult = {
  args: ClaimManyFnArgs | undefined
  totalClaimedAmount: JSBI
}

/**
 * Prepares the list of args to be passed to vCow.claimMany function
 */
function _getClaimManyArgs({
  claimInput,
  claims,
  account,
  connectedAccount,
}: GetClaimManyArgsParams): GetClaimManyArgsResult {
  // Arrays are named according to contract parameters
  // For more info, check https://github.com/gnosis/gp-v2-token/blob/main/src/contracts/mixins/MerkleDistributor.sol#L123
  const indices: ClaimManyFnArgs[0] = []
  const claimTypes: ClaimManyFnArgs[1] = []
  const claimants: ClaimManyFnArgs[2] = []
  const claimableAmounts: ClaimManyFnArgs[3] = []
  const claimedAmounts: ClaimManyFnArgs[4] = []
  const merkleProofs: ClaimManyFnArgs[5] = []
  const sendEth: ClaimManyFnArgs[6] = []

  let totalClaimedAmount = JSBI.BigInt('0')
  let totalValue = JSBI.BigInt('0')

  // Creating a map for faster access when checking what's being claimed
  const claimsMap = claims.reduce<Record<number, UserClaimData>>((acc, claim) => {
    acc[claim.index] = claim
    return acc
  }, {})

  claimInput.forEach((input) => {
    const claim = claimsMap[input.index]

    // It can be that the index being passed is already claimed or belongs to another account
    // Thus, it's possible that the returned `args` is "empty"
    if (claim) {
      indices.push(claim.index)
      // always the same
      claimants.push(account)
      // always the max available
      claimableAmounts.push(claim.amount)

      claimTypes.push(claim.type)
      // depends on claim type and whether claimed account == connected account
      const claimedAmount = _getClaimedAmount({ claim, input, account, connectedAccount })
      claimedAmounts.push(claimedAmount)

      merkleProofs.push(claim.proof)
      // only used on UserOption, equal to claimedAmount
      const value = claim.type === ClaimType.UserOption ? claimedAmount : '0'
      sendEth.push(value) // TODO: verify ETH balance < input.amount ?

      // sum of claimedAmounts for the toast notification
      totalClaimedAmount = JSBI.add(totalClaimedAmount, JSBI.BigInt(claimedAmount))
      // sum of Native currency to be used on call options
      totalValue = JSBI.add(totalValue, JSBI.BigInt(value))
    }
  })

  const value = totalValue.toString() === '0' ? undefined : totalValue.toString()
  const args: GetClaimManyArgsResult['args'] =
    indices.length > 0
      ? [indices, claimTypes, claimants, claimableAmounts, claimedAmounts, merkleProofs, sendEth, { value }]
      : undefined

  return {
    args,
    totalClaimedAmount,
  }
}

type GetClaimedAmountParams = Pick<GetClaimManyArgsParams, 'account' | 'connectedAccount'> & {
  claim: UserClaimData
  input: ClaimInput
}

/**
 * Gets the allowed claimed amount based on claim type and whether claiming account === connectedAccount
 * Rules are same as the contract to prevent reverts
 */
function _getClaimedAmount({ claim, input, account, connectedAccount }: GetClaimedAmountParams): string {
  if (
    _isClaimForOther(account, connectedAccount, claim) ||
    _isFreeClaim(claim) ||
    _hasNoInputOrInputIsGreaterThanClaimAmount(input, claim) ||
    // had to duplicate this check because I can't get TS to understand input.amount is not undefined in the else clause
    !input.amount
  ) {
    // use full amount
    return claim.amount
  } else {
    // use partial amount
    return input.amount
  }
}

/**
 * Claim 100% when claiming investment for someone else
 */
function _isClaimForOther(account: string, connectedAccount: string, claim: UserClaimData) {
  return account !== connectedAccount && claim.type in PAID_CLAIM_TYPES
}

/**
 * Claim 100% when it's a free claim
 */
function _isFreeClaim(claim: UserClaimData) {
  return claim.type in FREE_CLAIM_TYPES
}

/**
 * Claim 100% when input is not set
 * Claim 100% when input > amount
 */
function _hasNoInputOrInputIsGreaterThanClaimAmount(
  input: ClaimInput,
  claim: UserClaimData
): input is Required<ClaimInput> {
  return !input.amount || JSBI.greaterThan(JSBI.BigInt(input.amount), JSBI.BigInt(claim.amount))
}
