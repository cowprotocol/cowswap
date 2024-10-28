import { useCallback } from 'react'

import { Airdrop, AirdropAbi } from '@cowprotocol/abis'
import { formatTokenAmount } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Fraction } from '@uniswap/sdk-core'

import useSWR from 'swr'

import { useContract } from 'common/hooks/useContract'

import { AirdropDataInfo, IAirdrop, IClaimData } from '../types'

type IntervalsType = { [key: string]: string }

type ChunkDataType = { [key: string]: AirdropDataInfo[] }

export interface PreviewClaimableTokensParams {
  dataBaseUrl: string
  address: string
}

export const AIRDROP_PREVIEW_ERRORS = {
  NO_CLAIMABLE_TOKENS: 'You are not eligible for this airdrop',
  ERROR_FETCHING_DATA: 'There was an error trying to load claimable tokens',
  NO_CLAIMABLE_AIRDROPS: 'You possibly have other items to claim, but not Airdrops',
  UNEXPECTED_WRONG_FORMAT_DATA: 'Unexpected error fetching data: wrong format data',
}

/*
function to check if a name is inside a interval
intervals is in the format: {
    "name1":"name2",
    "name3":"name4",
    ...
}
name4 > name3 > name2 > name1

returns the interval key if the condition is checked, else undefined
*/
export function findIntervalKey(name: string, intervals: IntervalsType): string | undefined {
  const keys = Object.keys(intervals)

  if (keys.length === 0) {
    return
  }

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]

    if (key <= name && intervals[key] >= name) {
      return key
    }

    // Quit at once when verifying that name will not be in the intervals
    // Imagine searching for "Albert" in a phone list, but you've finished the "A" section
    if (key > name) {
      return
    }

    if (i === keys.length - 1) {
      return
    }
  }

  return
}

const fetchIntervals = async (dataBaseUrl: string): Promise<IntervalsType> => {
  const response = await fetch(dataBaseUrl + 'mapping.json')
  const intervals = await response.json()
  return intervals
}

const fetchChunk = async (dataBaseUrl: string, intervalKey: string): Promise<ChunkDataType> => {
  const response = await fetch(`${dataBaseUrl}chunks/${intervalKey}.json`)
  const chunkData = await response.json()
  return chunkData
}

const fetchAddressIsEligible = async ({
  dataBaseUrl,
  address,
}: PreviewClaimableTokensParams): Promise<AirdropDataInfo | undefined> => {
  const intervals = await fetchIntervals(dataBaseUrl)

  const intervalKey = findIntervalKey(address, intervals)

  // Interval key is undefined (user address is not in intervals)
  if (!intervalKey) throw new Error(AIRDROP_PREVIEW_ERRORS.NO_CLAIMABLE_TOKENS)

  const chunkData = await fetchChunk(dataBaseUrl, intervalKey)

  const addressLowerCase = address.toLowerCase()

  // The user address is not listed in chunk
  if (!(addressLowerCase in chunkData)) throw new Error(AIRDROP_PREVIEW_ERRORS.NO_CLAIMABLE_TOKENS)

  const airDropData = chunkData[addressLowerCase]
  // The user has other kind of tokens, but not airdrops
  if (airDropData.length < 1) throw new Error(AIRDROP_PREVIEW_ERRORS.NO_CLAIMABLE_AIRDROPS)

  return airDropData[0]
}

export const useClaimData = (selectedAirdrop?: IAirdrop) => {
  const { account } = useWalletInfo()
  const airdropContract = useContract<Airdrop>(selectedAirdrop?.address, AirdropAbi)

  const fetchPreviewClaimableTokens = useCallback(
    async ({ dataBaseUrl, address }: PreviewClaimableTokensParams): Promise<IClaimData> => {
      const isEligibleData = await fetchAddressIsEligible({ dataBaseUrl, address })
      if (!isEligibleData || !airdropContract || !isEligibleData.index || !selectedAirdrop || !account)
        throw new Error(AIRDROP_PREVIEW_ERRORS.ERROR_FETCHING_DATA)

      const isClaimed = await airdropContract?.isClaimed(isEligibleData.index)

      const callData = airdropContract.interface.encodeFunctionData('claim', [
        isEligibleData.index, //index
        account, //claimant
        isEligibleData.amount, //claimableAmount
        isEligibleData.proof, //merkleProof
      ])

      const token = selectedAirdrop.token
      const formattedAmount = isEligibleData.amount
        ? `${formatTokenAmount(new Fraction(isEligibleData.amount, 10 ** token.decimals))} ${token.symbol}`
        : `0,0 ${token.symbol}`

      return {
        ...isEligibleData,
        isClaimed,
        callData,
        contract: airdropContract,
        token,
        formattedAmount,
      }
    },
    [account, airdropContract, selectedAirdrop],
  )

  return useSWR<IClaimData | undefined, Error>(
    selectedAirdrop && account
      ? {
          dataBaseUrl: selectedAirdrop.dataBaseUrl,
          address: account.toLowerCase(),
        }
      : null,
    fetchPreviewClaimableTokens,
    { errorRetryCount: 0 },
  )
}
