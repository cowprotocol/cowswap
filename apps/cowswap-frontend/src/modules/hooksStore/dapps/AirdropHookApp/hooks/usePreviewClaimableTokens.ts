import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR from 'swr'

import { useVirtualTokenAirdropContract } from './useAirdropContract'

import { AirdropOption } from '../constants'

export interface PreviewClaimableTokensParams {
  dataBaseUrl: string
  address: string
}

type IntervalsType = { [key: string]: string }

export interface AirdropDataInfo {
  index: number
  type: string
  amount: string
  proof: any[]
}
export interface IClaimData extends AirdropDataInfo {
  isClaimed: boolean
}

type ChunkDataType = { [key: string]: AirdropDataInfo[] }

export const AIRDROP_PREVIEW_ERRORS = {
  NO_CLAIMABLE_TOKENS: "You don't have claimable tokens",
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
export function findIntervalKey(name: string, intervals: IntervalsType) {
  const keys = Object.keys(intervals)
  const numberOfKeys = keys.length
  let currentKeyIndex = 0
  let found = false
  while (!found) {
    const currentKey = keys[currentKeyIndex]
    if (currentKey <= name && intervals[currentKey] >= name) {
      return currentKey
      found = true
    }
    // Quit at once when verifying that name will not be in the intervals
    // Imagine searching for "Albert" in a phone list, but you've finished the "A" section
    if (currentKey > name) {
      return undefined
    }
    currentKeyIndex += 1
    if (currentKeyIndex > numberOfKeys) {
      return undefined
    }
  }
  return undefined
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

  const claimData = chunkData[addressLowerCase]

  const airDropData = claimData.filter((row: AirdropDataInfo) => row.type == 'Airdrop')
  // The user has other kind of tokens, but not airdrops
  if (airDropData.length < 1) throw new Error(AIRDROP_PREVIEW_ERRORS.NO_CLAIMABLE_AIRDROPS)

  return airDropData[0]
}

export const usePreviewClaimableTokens = (selectedAirdrop?: AirdropOption) => {
  const airdropContract = useVirtualTokenAirdropContract(selectedAirdrop?.addressesMapping)
  const { account } = useWalletInfo()

  const fetchPreviewClaimableTokens = async ({
    dataBaseUrl,
    address,
  }: PreviewClaimableTokensParams): Promise<IClaimData> => {
    const newClaimData = await fetchAddressIsEligible({ dataBaseUrl, address })
    if (!newClaimData || !airdropContract || !newClaimData.index)
      throw new Error(AIRDROP_PREVIEW_ERRORS.ERROR_FETCHING_DATA)

    const isClaimed = await airdropContract?.isClaimed(newClaimData.index)
    return {
      ...newClaimData,
      isClaimed,
    }
  }

  return useSWR<IClaimData | undefined>(
    selectedAirdrop && account
      ? {
          dataBaseUrl: selectedAirdrop.dataBaseUrl,
          address: account.toLowerCase(),
        }
      : null,
    fetchPreviewClaimableTokens,
    { errorRetryCount: 0 }
  )
}
