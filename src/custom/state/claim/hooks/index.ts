import { useCallback, useEffect, useMemo, useState } from 'react'
import JSBI from 'jsbi'
import ms from 'ms.macro'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { TransactionResponse } from '@ethersproject/providers'
import { parseUnits } from '@ethersproject/units'

import { VCow as VCowType } from 'abis/types'

import { useVCowContract } from 'hooks/useContract'
import { useActiveWeb3React } from 'hooks/web3'
import { useSingleContractMultipleData } from 'state/multicall/hooks'
import { useTransactionAdder } from 'state/enhancedTransactions/hooks'

import { V_COW } from 'constants/tokens'

import { formatSmart } from 'utils/format'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { isAddress } from 'utils'

import { getClaimKey, getClaimsRepoPath, transformRepoClaimsToUserClaims } from 'state/claim/hooks/utils'
import { SupportedChainId } from 'constants/chains'

export { useUserClaimData } from '@src/state/claim/hooks'

const CLAIMS_REPO_BRANCH = 'main'
export const CLAIMS_REPO = `https://raw.githubusercontent.com/gnosis/cow-merkle-drop/${CLAIMS_REPO_BRANCH}/`

// TODO: these values came from the test contract, might be different on real deployment
// Network variable price
export const NATIVE_TOKEN_PRICE = {
  [SupportedChainId.MAINNET]: '37500000000000', // '0.0000375' WETH (18 decimals) per vCOW, in wei
  [SupportedChainId.RINKEBY]: '37500000000000', // assuming Rinkeby has same price as Mainnet
  [SupportedChainId.XDAI]: '150000000000000000', // TODO: wild guess, wxDAI is same price as USDC
}
// Same on all networks. Actually, likely available only on Mainnet (and Rinkeby)
export const GNO_PRICE = '375000000000000' // '0.000375' GNO (18 decimals) per vCOW, in atoms
export const USDC_PRICE = '150000' // '0.15' USDC (6 decimals) per vCOW, in atoms

// Constants regarding investment time windows
const TWO_WEEKS = ms`2 weeks`
const SIX_WEEKS = ms`6 weeks`

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

type ClassifiedUserClaims = {
  available: UserClaims
  expired: UserClaims
  claimed: UserClaims
}

/**
 * Gets all user claims, classified
 *
 * @param account
 */
export function useClassifiedUserClaims(account: Account): ClassifiedUserClaims {
  const userClaims = useUserClaims(account)
  const contract = useVCowContract()

  const isInvestmentStillAvailable = useInvestmentStillAvailable()
  const isAirdropStillAvailable = useAirdropStillAvailable()

  // build list of parameters, with the claim index
  // we check for all claims because expired now might have been claimed before
  const claimIndexes = useMemo(() => userClaims?.map(({ index }) => [index]) || [], [userClaims])

  const results = useSingleContractMultipleData(contract, 'isClaimed', claimIndexes)

  return useMemo(() => {
    const available: UserClaims = []
    const expired: UserClaims = []
    const claimed: UserClaims = []

    if (!userClaims || userClaims.length === 0) {
      return { available, expired, claimed }
    }

    results.forEach((result, index) => {
      const claim = userClaims[index]

      if (
        result.valid && // result is valid
        !result.loading && // result is not loading
        result.result?.[0] === true // result true means claimed
      ) {
        claimed.push(claim)
      } else if (!isAirdropStillAvailable || (!isInvestmentStillAvailable && PAID_CLAIM_TYPES.includes(claim.type))) {
        expired.push(claim)
      } else {
        available.push(claim)
      }
    })

    return { available, expired, claimed }
  }, [isAirdropStillAvailable, isInvestmentStillAvailable, results, userClaims])
}

/**
 * Gets an array of available claims
 *
 * Syntactic sugar on top of `useClassifiedUserClaims`
 *
 * @param account
 */
export function useUserAvailableClaims(account: Account): UserClaims {
  const { available } = useClassifiedUserClaims(account)

  return available
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

    fetchClaims(account, chainId)
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
 * Fetches from contract the deployment timestamp in ms
 *
 * Returns null if in there's no network or vCowContract doesn't exist
 */
function useDeploymentTimestamp(): number | null {
  const { chainId } = useActiveWeb3React()
  const vCowContract = useVCowContract()
  const [timestamp, setTimestamp] = useState<number | null>(null)

  useEffect(() => {
    if (!chainId || !vCowContract) {
      return
    }

    vCowContract.deploymentTimestamp().then((ts) => {
      console.log(`Deployment timestamp in seconds: ${ts.toString()}`)
      setTimestamp(ts.mul('1000').toNumber())
    })
  }, [chainId, vCowContract])

  return timestamp
}

/**
 * Returns whether vCOW contract is still open for investments
 * Null when not applicable
 *
 * That is, there has been less than 2 weeks since it was deployed
 */
export function useInvestmentStillAvailable(): boolean {
  const deploymentTimestamp = useDeploymentTimestamp()

  return Boolean(deploymentTimestamp && deploymentTimestamp + TWO_WEEKS > Date.now())
}

/**
 * Returns whether vCOW contract is still open for airdrops
 * Null when not applicable
 *
 * That is, there has been less than 6 weeks since it was deployed
 */
export function useAirdropStillAvailable(): boolean {
  const deploymentTimestamp = useDeploymentTimestamp()

  return Boolean(deploymentTimestamp && deploymentTimestamp + SIX_WEEKS > Date.now())
}

/**
 * Helper function that checks whether selected investment options are still available
 *
 * Throws when claims are no longer possible
 */
function _validateClaimable(
  claims: UserClaims,
  input: ClaimInput[],
  isInvestmentStillAvailable: boolean,
  isAirdropStillAvailable: boolean
): void {
  if (!isAirdropStillAvailable) {
    throw new Error(`Contract no longer accepts claims`)
  }

  input.forEach(({ index }) => {
    const claim = claims.find((claim) => claim.index === index)

    if (claim && !isInvestmentStillAvailable && PAID_CLAIM_TYPES.includes(claim.type)) {
      throw new Error(`Contract no longer accepts investment type claims`)
    }
  })
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

  const isInvestmentStillAvailable = useInvestmentStillAvailable()
  const isAirdropStillAvailable = useAirdropStillAvailable()

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

      _validateClaimable(claims, claimInput, isInvestmentStillAvailable, isAirdropStillAvailable)

      const { args, totalClaimedAmount } = _getClaimManyArgs({ claimInput, claims, account, connectedAccount, chainId })

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
    [
      account,
      addTransaction,
      chainId,
      claims,
      connectedAccount,
      isAirdropStillAvailable,
      isInvestmentStillAvailable,
      vCowContract,
      vCowToken,
    ]
  )

  return { claimCallback }
}

type GetClaimManyArgsParams = {
  claimInput: ClaimInput[]
  claims: UserClaims
  account: string
  connectedAccount: string
  chainId: SupportedChainId
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
  chainId,
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
      // only used on UserOption
      const value = _getClaimValue(claim, claimedAmount, chainId)
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

/**
 * Calculates native value based on claim vCowAmount and type
 *
 * Value will only be != '0' if claim type is UserOption
 * Assumes the checks were done previously regarding which amounts are allowed
 *
 * The calculation is done based on the formula:
 * vCowAmount * wethPrice / 10^18
 * See https://github.com/gnosis/gp-v2-token/blob/main/src/contracts/mixins/Claiming.sol#L314-L320
 */
function _getClaimValue(claim: UserClaimData, vCowAmount: string, chainId: SupportedChainId): string {
  if (claim.type !== ClaimType.UserOption) {
    return '0'
  }

  const price = NATIVE_TOKEN_PRICE[chainId]

  const claimValueInAtoms = JSBI.multiply(JSBI.BigInt(vCowAmount), JSBI.BigInt(price))

  return parseUnits(claimValueInAtoms.toString(), 18).toString()
}

type LastAddress = string
type ClaimAddressMapping = { [firstAddress: string]: LastAddress }
const FETCH_CLAIM_MAPPING_PROMISES: Record<number, Promise<ClaimAddressMapping> | null> = {}

/**
 * Customized fetchClaimMapping function
 */
function fetchClaimsMapping(chainId: number): Promise<ClaimAddressMapping> {
  return (
    FETCH_CLAIM_MAPPING_PROMISES[chainId] ??
    (FETCH_CLAIM_MAPPING_PROMISES[chainId] = fetch(`${getClaimsRepoPath(chainId)}mapping.json`)
      .then((res) => res.json())
      .catch((error) => {
        console.error(`Failed to get claims mapping for chain ${chainId}`, error)
        FETCH_CLAIM_MAPPING_PROMISES[chainId] = null
      }))
  )
}

const FETCH_CLAIM_FILE_PROMISES: { [startingAddress: string]: Promise<{ [address: string]: RepoClaims }> } = {}

/**
 * Customized fetchClaimFile function
 */
function fetchClaimsFile(address: string, chainId: number): Promise<{ [address: string]: RepoClaims }> {
  const key = getClaimKey(address, chainId)
  return (
    FETCH_CLAIM_FILE_PROMISES[key] ??
    (FETCH_CLAIM_FILE_PROMISES[key] = fetch(`${getClaimsRepoPath(chainId)}chunks/${address}.json`) // mod
      .then((res) => res.json())
      .catch((error) => {
        console.error(`Failed to get claim file mapping on chain ${chainId} for starting address ${address}`, error)
        delete FETCH_CLAIM_FILE_PROMISES[key]
      }))
  )
}

const FETCH_CLAIM_PROMISES: { [key: string]: Promise<UserClaims> } = {}

/**
 * Customized fetchClaim function
 * Returns the claim for the given address, or null if not valid
 */
function fetchClaims(account: string, chainId: number): Promise<UserClaims> {
  const formatted = isAddress(account)
  if (!formatted) return Promise.reject(new Error('Invalid address'))

  const claimKey = getClaimKey(formatted, chainId)

  return (
    FETCH_CLAIM_PROMISES[claimKey] ??
    (FETCH_CLAIM_PROMISES[claimKey] = fetchClaimsMapping(chainId)
      .then((mapping) => {
        const sorted = Object.keys(mapping).sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))

        for (const startingAddress of sorted) {
          const lastAddress = mapping[startingAddress]
          if (startingAddress.toLowerCase() <= formatted.toLowerCase()) {
            if (formatted.toLowerCase() <= lastAddress.toLowerCase()) {
              return startingAddress
            }
          } else {
            throw new Error(`Claim for ${claimKey} was not found in partial search`)
          }
        }
        throw new Error(`Claim for ${claimKey} was not found after searching all mappings`)
      })
      .then((address) => fetchClaimsFile(address, chainId))
      .then((result) => {
        if (result[formatted]) return transformRepoClaimsToUserClaims(result[formatted]) // mod
        throw new Error(`Claim for ${claimKey} was not found in claim file!`)
      })
      .catch((error) => {
        console.debug(`Claim fetch failed for ${claimKey}`, error)
        throw error
      }))
  )
}
