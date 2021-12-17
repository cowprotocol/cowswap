import JSBI from 'jsbi'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { TransactionResponse } from '@ethersproject/providers'
// import { useEffect, useState } from 'react'
import { UNI } from 'constants/tokens'
import { useActiveWeb3React } from 'hooks/web3'
import { useMerkleDistributorContract } from 'hooks/useContract'
import { calculateGasMargin } from 'utils/calculateGasMargin'
// import { useSingleCallResult } from 'state/multicall/hooks'
import { isAddress } from 'utils/index'
import { useTransactionAdder } from 'state/enhancedTransactions/hooks'
import { UserClaims } from '.'

// interface UserClaimData {
//   index: number
//   amount: string
//   proof: string[]
//   flags?: {
//     isSOCKS: boolean
//     isLP: boolean
//     isUser: boolean
//   }
// }

type LastAddress = string
type ClaimAddressMapping = { [firstAddress: string]: LastAddress }
let FETCH_CLAIM_MAPPING_PROMISE: Promise<ClaimAddressMapping> | null = null
function fetchClaimsMapping(): Promise<ClaimAddressMapping> {
  return (
    FETCH_CLAIM_MAPPING_PROMISE ??
    (FETCH_CLAIM_MAPPING_PROMISE = fetch(
      `https://raw.githubusercontent.com/gnosis/cow-mrkl-drop-data-chunks/final/chunks/mapping.json`
    )
      .then((res) => res.json())
      .catch((error) => {
        console.error('Failed to get claims mapping', error)
        FETCH_CLAIM_MAPPING_PROMISE = null
      }))
  )
}

const FETCH_CLAIM_FILE_PROMISES: { [startingAddress: string]: Promise<{ [address: string]: UserClaims }> } = {}
function fetchClaimsFile(key: string): Promise<{ [address: string]: UserClaims }> {
  return (
    FETCH_CLAIM_FILE_PROMISES[key] ??
    (FETCH_CLAIM_FILE_PROMISES[key] = fetch(
      `https://raw.githubusercontent.com/gnosis/cow-mrkl-drop-data-chunks/final/chunks/${key}.json`
    )
      .then((res) => res.json())
      .catch((error) => {
        console.error(`Failed to get claim file mapping for starting address ${key}`, error)
        delete FETCH_CLAIM_FILE_PROMISES[key]
      }))
  )
}

const FETCH_CLAIM_PROMISES: { [key: string]: Promise<UserClaims> } = {}

// returns the claim for the given address, or null if not valid
export function fetchClaims(account: string): Promise<UserClaims> {
  const formatted = isAddress(account)
  if (!formatted) return Promise.reject(new Error('Invalid address'))

  return (
    FETCH_CLAIM_PROMISES[account] ??
    (FETCH_CLAIM_PROMISES[account] = fetchClaimsMapping()
      .then((mapping) => {
        const sorted = Object.keys(mapping).sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))

        for (const startingAddress of sorted) {
          const lastAddress = mapping[startingAddress]
          if (startingAddress.toLowerCase() <= formatted.toLowerCase()) {
            if (formatted.toLowerCase() <= lastAddress.toLowerCase()) {
              return startingAddress
            }
          } else {
            throw new Error(`Claim for ${formatted} was not found in partial search`)
          }
        }
        throw new Error(`Claim for ${formatted} was not found after searching all mappings`)
      })
      .then(fetchClaimsFile)
      .then((result) => {
        if (result[formatted]) return result[formatted]
        throw new Error(`Claim for ${formatted} was not found in claim file!`)
      })
      .catch((error) => {
        console.debug('Claim fetch failed', error)
        throw error
      }))
  )
}

// parse distributorContract blob and detect if user has claim data
// null means we know it does not
export function useUserClaims(account: string | null | undefined): UserClaims | null {
  console.log('[useUserClaims] ', account)
  return [
    {
      index: 0,
      amount: '100000000000000000',
      proof: ['this', 'proofs', 'nothing'],
    },
    {
      index: 1,
      amount: '2000000000000000000',
      proof: ['this', 'proofs', 'even', 'less'],
    },
  ]
  // const { chainId } = useActiveWeb3React()
  // const [claimInfo, setClaimInfo] = useState<{ [account: string]: UserClaims | null }>({})

  // useEffect(() => {
  //   if (!account || chainId !== 1) return

  //   fetchClaims(account)
  //     .then((accountClaimInfo) =>
  //       setClaimInfo((claimInfo) => {
  //         return {
  //           ...claimInfo,
  //           [account]: accountClaimInfo,
  //         }
  //       })
  //     )
  //     .catch(() => {
  //       setClaimInfo((claimInfo) => {
  //         return {
  //           ...claimInfo,
  //           [account]: null,
  //         }
  //       })
  //     })
  // }, [account, chainId])

  // return account && chainId === 1 ? claimInfo[account] : null
}

// check if user is in blob and has not yet claimed UNI
export function useUserHasAvailableClaim(account: string | null | undefined): boolean {
  const userClaims = useUserClaims(account)
  // const distributorContract = useMerkleDistributorContract()

  // TODO: Go claiming by claiming, and check if claimed or not
  // TODO: Should we do a multicall instead, or the contract allows to check multiple claimings at once?
  const isClaimedResult = { loading: false, result: [false] } //useSingleCallResult(distributorContract, 'isClaimed', [userClaimData?.index])

  // user is in blob and contract marks as unclaimed
  return Boolean(userClaims && !isClaimedResult.loading && isClaimedResult.result?.[0] === false)
}

export function useUserUnclaimedAmount(account: string | null | undefined): CurrencyAmount<Token> | undefined {
  const { chainId } = useActiveWeb3React()
  const claims = useUserClaims(account)
  const canClaim = useUserHasAvailableClaim(account)

  const uni = chainId ? UNI[chainId] : undefined
  if (!uni) return undefined
  if (!canClaim || !claims) {
    return CurrencyAmount.fromRawAmount(uni, JSBI.BigInt(0))
  }
  const totalAmount = claims.reduce((acc, claim) => {
    return JSBI.add(acc, JSBI.BigInt(claim.amount))
  }, JSBI.BigInt('0'))

  return CurrencyAmount.fromRawAmount(uni, JSBI.BigInt(totalAmount))
}

export function useClaimCallback(account: string | null | undefined): {
  claimCallback: () => Promise<string>
} {
  // get claim data for this account
  const { library, chainId } = useActiveWeb3React()
  const claimData = useUserClaims(account)

  // used for popup summary
  const unclaimedAmount: CurrencyAmount<Token> | undefined = useUserUnclaimedAmount(account)
  const addTransaction = useTransactionAdder()
  const distributorContract = useMerkleDistributorContract()

  const claimCallback = async function () {
    if (!claimData || !account || !library || !chainId || !distributorContract) return

    // const args = [claimData.index, account, claimData.amount, claimData.proof]

    // TODO: Reduce Claimings into a bunch of arrays with all the claimings
    // const args = claimData.reduce(...)
    const args: string[] = []

    return distributorContract.estimateGas['claim'](...args, {}).then((estimatedGasLimit) => {
      return distributorContract
        .claim(...args, { value: null, gasLimit: calculateGasMargin(chainId, estimatedGasLimit) })
        .then((response: TransactionResponse) => {
          addTransaction({
            hash: response.hash,
            summary: `Claimed ${unclaimedAmount?.toSignificant(4)} CoW`,
            claim: { recipient: account },
          })
          return response.hash
        })
    })
  }

  return { claimCallback }
}
