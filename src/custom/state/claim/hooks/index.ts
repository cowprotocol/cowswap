import { useCallback, useEffect, useMemo, useState } from 'react'
import JSBI from 'jsbi'
import ms from 'ms.macro'
import { CurrencyAmount, Price, Token } from '@uniswap/sdk-core'
import { TransactionResponse } from '@ethersproject/providers'
import { parseUnits } from '@ethersproject/units'
import { BigNumber } from '@ethersproject/bignumber'

import { VCow as VCowType } from 'abis/types'

import { useVCowContract } from 'hooks/useContract'
import { useActiveWeb3React } from 'hooks/web3'
import { useSingleContractMultipleData } from 'state/multicall/hooks'
import { useTransactionAdder } from 'state/enhancedTransactions/hooks'

import { GpEther, V_COW } from 'constants/tokens'

import { formatSmart } from 'utils/format'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { isAddress } from 'utils'

import {
  getClaimKey,
  getClaimsRepoPath,
  isFreeClaim,
  claimTypeToTokenAmount,
  transformRepoClaimsToUserClaims,
} from 'state/claim/hooks/utils'
import { SupportedChainId } from 'constants/chains'
import { registerOnWindow } from 'utils/misc'
import mockData, { MOCK_INDICES } from './mocks/claimData'
import { getIndexes } from './utils'
import { useAllClaimingTransactionIndices } from 'state/enhancedTransactions/hooks'

export { useUserClaimData } from '@src/state/claim/hooks'

import { AppDispatch } from 'state'
import { useSelector, useDispatch } from 'react-redux'
import { AppState } from 'state'

import {
  setInputAddress,
  setActiveClaimAccount,
  setActiveClaimAccountENS,
  setIsSearchUsed,
  setClaimStatus,
  setClaimedAmount,
  setIsInvestFlowActive,
  setInvestFlowStep,
  initInvestFlowData,
  updateInvestAmount,
  setSelected,
  setSelectedAll,
  ClaimStatus,
  resetClaimUi,
  updateInvestError,
} from '../actions'
import { EnhancedUserClaimData } from 'pages/Claim/types'
import { supportedChainId } from 'utils/supportedChainId'

const CLAIMS_REPO_BRANCH = 'main'
export const CLAIMS_REPO = `https://raw.githubusercontent.com/gnosis/cow-merkle-drop/${CLAIMS_REPO_BRANCH}/`

// Base amount = 1 VCOW
const ONE_VCOW = CurrencyAmount.fromRawAmount(
  V_COW[SupportedChainId.RINKEBY],
  parseUnits('1', V_COW[SupportedChainId.RINKEBY].decimals).toString()
)

// Constants regarding investment time windows
const INVESTMENT_TIME = ms`2 weeks`
const AIRDROP_TIME = ms`6 weeks`

// For native token price calculation
const DENOMINATOR = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18))

export enum ClaimType {
  Airdrop, // free, no vesting, can be available on both mainnet and gchain
  GnoOption, // paid, with vesting, must use GNO, can be available on both mainnet and gchain
  UserOption, // paid, with vesting, must use Native currency, can be available on both mainnet and gchain
  Investor, // paid, with vesting, must use USDC, only on mainnet
  Team, // free, with vesting, only on mainnet
  Advisor, // free, with vesting, only on mainnet
}

export type TypeToPriceMapper = Map<ClaimType, number>

// Hardcoded values
export const ClaimTypePriceMap: TypeToPriceMapper = new Map([
  [ClaimType.GnoOption, 16.66],
  [ClaimType.Investor, 26.66],
  [ClaimType.UserOption, 36.66],
])

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

  const { isInvestmentWindowOpen, isAirdropWindowOpen } = useClaimTimeInfo()

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
      } else if (!isAirdropWindowOpen || (!isInvestmentWindowOpen && PAID_CLAIM_TYPES.includes(claim.type))) {
        expired.push(claim)
      } else {
        available.push(claim)
      }
    })

    return { available, expired, claimed }
  }, [isAirdropWindowOpen, isInvestmentWindowOpen, results, userClaims])
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
  const pendingIndices = useAllClaimingTransactionIndices()

  const vCow = chainId ? V_COW[chainId] : undefined
  if (!vCow) return undefined
  if (!claims || claims.length === 0) {
    return CurrencyAmount.fromRawAmount(vCow, JSBI.BigInt(0))
  }

  const totalAmount = claims.reduce((acc, claim) => {
    // don't add pending
    if (pendingIndices.has(claim.index)) return acc

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

// TODO: remove
const createMockTx = (data: number[]) => ({
  hash: '0x' + Math.round(Math.random() * 10).toString() + 'AxAFjAhG89G89AfnLK3CCxAfnLKQffQ782G89AfnLK3CCxxx123FF',
  summary: `Claimed ${Math.random() * 3337} vCOW`,
  claim: { recipient: '0x97EC4fcD5F78cA6f6E4E1EAC6c0Ec8421bA518B7', indices: data },
})

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

type ClaimTimeInfo = {
  /**
   * Time when contract was deployed, fetched from chain
   */
  deployment: number | null
  /**
   * Time when investment window will close (2 weeks after contract deployment)
   */
  investmentDeadline: number | null
  /**
   * Time when airdrop window will close (6 weeks after contract deployment)
   */
  airdropDeadline: number | null
  /**
   * Whether investment window is still open, based on local time
   */
  isInvestmentWindowOpen: boolean
  /**
   * Whether airdrop window is still open, based on local time
   */
  isAirdropWindowOpen: boolean
}

/**
 * Overall Claim time related properties
 */
export function useClaimTimeInfo(): ClaimTimeInfo {
  const deployment = useDeploymentTimestamp()
  const investmentDeadline = deployment && deployment + INVESTMENT_TIME
  const airdropDeadline = deployment && deployment + AIRDROP_TIME

  const isInvestmentWindowOpen = Boolean(investmentDeadline && investmentDeadline > Date.now())
  const isAirdropWindowOpen = Boolean(airdropDeadline && airdropDeadline > Date.now())

  return { deployment, investmentDeadline, airdropDeadline, isInvestmentWindowOpen, isAirdropWindowOpen }
}

export function useNativeTokenPrice(): string | null {
  return _useVCowPriceForToken('nativeTokenPrice')
}

export function useGnoPrice(): string | null {
  return _useVCowPriceForToken('gnoPrice')
}

export function useUsdcPrice(): string | null {
  return _useVCowPriceForToken('usdcPrice')
}

type VCowPriceFnNames = 'nativeTokenPrice' | 'gnoPrice' | 'usdcPrice'

/**
 * Generic hook for fetching contract value for the many prices
 */
function _useVCowPriceForToken(priceFnName: VCowPriceFnNames): string | null {
  const { chainId } = useActiveWeb3React()
  const vCowContract = useVCowContract()

  const [price, setPrice] = useState<string | null>(null)

  useEffect(() => {
    if (!chainId || !vCowContract) {
      return
    }
    console.debug(`_useVCowPriceForToken::fetching price for `, priceFnName)

    vCowContract[priceFnName]().then((price: BigNumber) => setPrice(price.toString()))
  }, [chainId, priceFnName, vCowContract])

  return price
}

export type VCowPrices = {
  native: string | null
  gno: string | null
  usdc: string | null
}

export function useVCowPrices(): VCowPrices {
  const native = useNativeTokenPrice()
  const gno = useGnoPrice()
  const usdc = useUsdcPrice()

  return useMemo(() => ({ native, gno, usdc }), [gno, native, usdc])
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
  const nativeTokenPrice = useNativeTokenPrice()

  const { isInvestmentWindowOpen, isAirdropWindowOpen } = useClaimTimeInfo()

  // used for popup summary
  const addTransaction = useTransactionAdder()
  const vCowToken = chainId ? V_COW[chainId] : undefined

  // TODO: remove
  registerOnWindow({
    addMockClaimTransactions: (data?: number[]) => {
      let finalData: number[] | undefined = data

      if (!finalData) {
        const mockDataIndices = connectedAccount ? getIndexes(mockData[connectedAccount] || []) : []
        finalData = mockDataIndices?.length > 0 ? mockDataIndices : MOCK_INDICES
      }

      return addTransaction(createMockTx(finalData))
    },
  })

  /**
   * Extend the Payable optional param
   */
  function _extendFinalArg(args: ClaimManyFnArgs, extendedArg: Record<any, any>) {
    const lastArg = args.pop()
    args.push({
      ...lastArg, // add back whatever is already there
      ...extendedArg,
    })

    return args
  }

  const claimCallback = useCallback(
    async function (claimInput: ClaimInput[]) {
      if (
        claims.length === 0 ||
        claimInput.length === 0 ||
        !account ||
        !connectedAccount ||
        !chainId ||
        !vCowContract ||
        !vCowToken ||
        !nativeTokenPrice
      ) {
        throw new Error("Not initialized, can't claim")
      }

      _validateClaimable(claims, claimInput, isInvestmentWindowOpen, isAirdropWindowOpen)

      const { args, totalClaimedAmount } = _getClaimManyArgs({
        claimInput,
        claims,
        account,
        connectedAccount,
        nativeTokenPrice,
      })

      if (!args) {
        throw new Error('There were no valid claims selected')
      }

      const vCowAmount = CurrencyAmount.fromRawAmount(vCowToken, totalClaimedAmount)

      return vCowContract.estimateGas.claimMany(...args).then((estimatedGas) => {
        // Last item in the array contains the call overrides
        const extendedArgs = _extendFinalArg(args, {
          from: connectedAccount, // add the `from` as the connected account
          gasLimit: calculateGasMargin(chainId, estimatedGas), // add the estimated gas limit
        })

        return vCowContract.claimMany(...extendedArgs).then((response: TransactionResponse) => {
          addTransaction({
            hash: response.hash,
            summary: `Claim ${formatSmart(vCowAmount)} vCOW`,
            claim: { recipient: account, indices: args[0] as number[] },
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
      isAirdropWindowOpen,
      isInvestmentWindowOpen,
      nativeTokenPrice,
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
  nativeTokenPrice: string
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
  nativeTokenPrice,
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
      const value = _getClaimValue(claim, claimedAmount, nativeTokenPrice)
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
    isFreeClaim(claim.type) ||
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
  return account !== connectedAccount && !isFreeClaim(claim.type)
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
function _getClaimValue(claim: UserClaimData, vCowAmount: string, nativeTokenPrice: string): string {
  if (claim.type !== ClaimType.UserOption) {
    return '0'
  }

  // Why InAtomsSquared? because we are multiplying vCowAmount (which is in atoms == * 10**18)
  // by the price (which is also in atoms == * 10**18)
  const claimValueInAtomsSquared = JSBI.multiply(JSBI.BigInt(vCowAmount), JSBI.BigInt(nativeTokenPrice))
  // Then it's divided by 10**18 to return the value in the native currency atoms
  return JSBI.divide(claimValueInAtomsSquared, DENOMINATOR).toString()
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

export function useClaimDispatchers() {
  const dispatch = useDispatch<AppDispatch>()

  return useMemo(
    () => ({
      // account
      setInputAddress: (payload: string) => dispatch(setInputAddress(payload)),
      setActiveClaimAccount: (payload: string) => dispatch(setActiveClaimAccount(payload)),
      setActiveClaimAccountENS: (payload: string) => dispatch(setActiveClaimAccountENS(payload)),
      // search
      setIsSearchUsed: (payload: boolean) => dispatch(setIsSearchUsed(payload)),
      // claiming
      setClaimStatus: (payload: ClaimStatus) => dispatch(setClaimStatus(payload)),
      setClaimedAmount: (payload: number) => dispatch(setClaimedAmount(payload)),
      // investing
      setIsInvestFlowActive: (payload: boolean) => dispatch(setIsInvestFlowActive(payload)),
      setInvestFlowStep: (payload: number) => dispatch(setInvestFlowStep(payload)),
      initInvestFlowData: () => dispatch(initInvestFlowData()),
      updateInvestAmount: (payload: { index: number; amount: string }) => dispatch(updateInvestAmount(payload)),
      updateInvestError: (payload: { index: number; error: string | undefined }) =>
        dispatch(updateInvestError(payload)),
      // claim row selection
      setSelected: (payload: number[]) => dispatch(setSelected(payload)),
      setSelectedAll: (payload: boolean) => dispatch(setSelectedAll(payload)),
      // reset claim ui
      resetClaimUi: () => dispatch(resetClaimUi()),
    }),
    [dispatch]
  )
}

export function useClaimState() {
  return useSelector((state: AppState) => state.claim)
}

/**
 * Gets an array of available claims parsed and sorted for the UI
 *
 * Syntactic sugar on top of `useUserClaims`
 *
 * @param account
 */
export function useUserEnhancedClaimData(account: Account): EnhancedUserClaimData[] {
  const { available } = useClassifiedUserClaims(account)
  const { chainId: preCheckChainId } = useActiveWeb3React()
  const native = useNativeTokenPrice()
  const gno = useGnoPrice()
  const usdc = useUsdcPrice()

  const sorted = useMemo(() => available.sort(_sortTypes), [available])

  return useMemo(() => {
    const chainId = supportedChainId(preCheckChainId)
    if (!chainId || !native || !gno || !usdc) return []

    return sorted.map((claim) => _enhanceClaimData(claim, chainId, { native, gno, usdc }))
  }, [gno, native, preCheckChainId, sorted, usdc])
}

function _sortTypes(a: UserClaimData, b: UserClaimData): number {
  return Number(isFreeClaim(b.type)) - Number(isFreeClaim(a.type))
}

function _enhanceClaimData(claim: UserClaimData, chainId: SupportedChainId, prices: VCowPrices): EnhancedUserClaimData {
  const claimAmount = CurrencyAmount.fromRawAmount(ONE_VCOW.currency, claim.amount)

  const data: EnhancedUserClaimData = {
    ...claim,
    isFree: isFreeClaim(claim.type),
    claimAmount,
  }

  const tokenAndAmount = claimTypeToTokenAmount(claim.type, chainId, prices)

  // Free claims will have tokenAndAmount === undefined
  // If it's not a free claim, store the price and calculate cost in investment token
  if (tokenAndAmount?.amount) {
    data.price = _getPrice(tokenAndAmount)
    // get the currency amount using the price base currency (remember price was inverted)
    data.currencyAmount = CurrencyAmount.fromRawAmount(data.price.baseCurrency, claim.amount)

    // e.g 1000 vCow / 20 GNO = 50 GNO cost
    data.cost = data.currencyAmount.divide(data.price)
  }

  return data
}

function _getPrice({ token, amount }: { amount: string; token: Token | GpEther }) {
  return new Price({
    baseAmount: ONE_VCOW,
    quoteAmount: CurrencyAmount.fromRawAmount(token, amount),
  }).invert()
}
