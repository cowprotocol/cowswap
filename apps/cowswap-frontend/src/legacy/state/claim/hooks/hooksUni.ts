import { useEffect, useState } from 'react'

import MerkleDistributorJson from '@uniswap/merkle-distributor/build/MerkleDistributor.json'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import JSBI from 'jsbi'

import { MERKLE_DISTRIBUTOR_ADDRESS } from 'legacy/constants/addresses'
import { UNI } from 'legacy/constants/tokens'

import { useWalletInfo } from 'modules/wallet'

import { useSingleCallResult } from 'lib/hooks/multicall'

import { useContract } from '../../../hooks/useContract'
import { isAddress } from '../../../utils'

const MERKLE_DISTRIBUTOR_ABI = MerkleDistributorJson.abi

function useMerkleDistributorContract() {
  return useContract(MERKLE_DISTRIBUTOR_ADDRESS, MERKLE_DISTRIBUTOR_ABI, true)
}

interface UserClaimData {
  index: number
  amount: string
  proof: string[]
  flags?: {
    isSOCKS: boolean
    isLP: boolean
    isUser: boolean
  }
}

type LastAddress = string
type ClaimAddressMapping = { [firstAddress: string]: LastAddress }
let FETCH_CLAIM_MAPPING_PROMISE: Promise<ClaimAddressMapping> | null = null
function fetchClaimMapping(): Promise<ClaimAddressMapping> {
  return (
    FETCH_CLAIM_MAPPING_PROMISE ??
    (FETCH_CLAIM_MAPPING_PROMISE = fetch(
      `https://raw.githubusercontent.com/Uniswap/mrkl-drop-data-chunks/final/chunks/mapping.json`
    )
      .then((res) => res.json())
      .catch((error) => {
        console.error('Failed to get claims mapping', error)
        FETCH_CLAIM_MAPPING_PROMISE = null
      }))
  )
}

const FETCH_CLAIM_FILE_PROMISES: { [startingAddress: string]: Promise<{ [address: string]: UserClaimData }> } = {}
function fetchClaimFile(key: string): Promise<{ [address: string]: UserClaimData }> {
  return (
    FETCH_CLAIM_FILE_PROMISES[key] ??
    (FETCH_CLAIM_FILE_PROMISES[key] = fetch(
      `https://raw.githubusercontent.com/Uniswap/mrkl-drop-data-chunks/final/chunks/${key}.json`
    )
      .then((res) => res.json())
      .catch((error) => {
        console.error(`Failed to get claim file mapping for starting address ${key}`, error)
        delete FETCH_CLAIM_FILE_PROMISES[key]
      }))
  )
}

const FETCH_CLAIM_PROMISES: { [key: string]: Promise<UserClaimData> } = {}
// returns the claim for the given address, or null if not valid
function fetchClaim(account: string): Promise<UserClaimData> {
  const formatted = isAddress(account)
  if (!formatted) return Promise.reject(new Error('Invalid address'))

  return (
    FETCH_CLAIM_PROMISES[account] ??
    (FETCH_CLAIM_PROMISES[account] = fetchClaimMapping()
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
      .then(fetchClaimFile)
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
export function useUserClaimData(account: string | null | undefined): UserClaimData | null {
  const { chainId } = useWalletInfo()

  const [claimInfo, setClaimInfo] = useState<{ [account: string]: UserClaimData | null }>({})

  useEffect(() => {
    if (!account || chainId !== 1) return

    fetchClaim(account)
      .then((accountClaimInfo) =>
        setClaimInfo((claimInfo) => {
          return {
            ...claimInfo,
            [account]: accountClaimInfo,
          }
        })
      )
      .catch(() => {
        setClaimInfo((claimInfo) => {
          return {
            ...claimInfo,
            [account]: null,
          }
        })
      })
  }, [account, chainId])

  return account && chainId === 1 ? claimInfo[account] : null
}

// check if user is in blob and has not yet claimed UNI
export function useUserHasAvailableClaim(account: string | null | undefined): boolean {
  const userClaimData = useUserClaimData(account)
  const distributorContract = useMerkleDistributorContract()
  const isClaimedResult = useSingleCallResult(distributorContract, 'isClaimed', [userClaimData?.index])
  // user is in blob and contract marks as unclaimed
  return Boolean(userClaimData && !isClaimedResult.loading && isClaimedResult.result?.[0] === false)
}

export function useUserUnclaimedAmount(account: string | null | undefined): CurrencyAmount<Token> | undefined {
  const { chainId } = useWalletInfo()
  const userClaimData = useUserClaimData(account)
  const canClaim = useUserHasAvailableClaim(account)

  const uni = chainId ? UNI[chainId] : undefined
  if (!uni) return undefined
  if (!canClaim || !userClaimData) {
    return CurrencyAmount.fromRawAmount(uni, JSBI.BigInt(0))
  }
  return CurrencyAmount.fromRawAmount(uni, JSBI.BigInt(userClaimData.amount))
}
