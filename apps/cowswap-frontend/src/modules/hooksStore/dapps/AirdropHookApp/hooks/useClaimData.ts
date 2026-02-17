import { useCallback } from 'react'

import { formatTokenAmount } from '@cowprotocol/common-utils'
import { AirdropAbi } from '@cowprotocol/cowswap-abis'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Fraction } from '@uniswap/sdk-core'

import { MessageDescriptor } from '@lingui/core'
import { i18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import useSWR from 'swr'
import { encodeFunctionData } from 'viem'
import { useConfig } from 'wagmi'
import { readContract } from 'wagmi/actions'

import { AirdropDataInfo, IAirdrop, IClaimData } from '../types'

import type { Hex } from 'viem'

type IntervalsType = { [key: string]: string }

type ChunkDataType = { [key: string]: AirdropDataInfo[] }

export interface PreviewClaimableTokensParams {
  dataBaseUrl: string
  address: string
}

export const AIRDROP_PREVIEW_ERRORS: Record<string, MessageDescriptor> = {
  NO_CLAIMABLE_TOKENS: msg`You are not eligible for this airdrop`,
  ERROR_FETCHING_DATA: msg`There was an error trying to load claimable tokens`,
  NO_CLAIMABLE_AIRDROPS: msg`You possibly have other items to claim, but not Airdrops`,
  UNEXPECTED_WRONG_FORMAT_DATA: msg`Unexpected error fetching data: wrong format data`,
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
  if (!intervalKey) throw new Error(i18n._(AIRDROP_PREVIEW_ERRORS.NO_CLAIMABLE_TOKENS))

  const chunkData = await fetchChunk(dataBaseUrl, intervalKey)

  const addressLowerCase = address.toLowerCase()

  // The user address is not listed in chunk
  if (!(addressLowerCase in chunkData)) throw new Error(i18n._(AIRDROP_PREVIEW_ERRORS.NO_CLAIMABLE_TOKENS))

  const airDropData = chunkData[addressLowerCase]
  // The user has other kind of tokens, but not airdrops
  if (airDropData.length < 1) throw new Error(i18n._(AIRDROP_PREVIEW_ERRORS.NO_CLAIMABLE_TOKENS))

  return airDropData[0]
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useClaimData = (tokenToClaimData?: IAirdrop) => {
  const config = useConfig()
  const { account } = useWalletInfo()
  const { i18n } = useLingui()

  const fetchPreviewClaimableTokens = useCallback(
    async ({ dataBaseUrl, address }: PreviewClaimableTokensParams): Promise<IClaimData> => {
      const isEligibleData = await fetchAddressIsEligible({ dataBaseUrl, address })
      if (!isEligibleData || !isEligibleData.index || !tokenToClaimData || !account) {
        throw new Error(i18n._(AIRDROP_PREVIEW_ERRORS.ERROR_FETCHING_DATA))
      }

      const { token: tokenToClaim } = tokenToClaimData

      const isClaimed = await readContract(config, {
        abi: AirdropAbi,
        address: tokenToClaimData.address,
        functionName: 'isClaimed',
        args: [BigInt(isEligibleData.index)],
      })

      const callData = encodeFunctionData({
        abi: AirdropAbi,
        functionName: 'claim',
        args: [
          BigInt(isEligibleData.index), //index
          account, //claimant
          BigInt(isEligibleData.amount), //claimableAmount
          isEligibleData.proof as Hex[], //merkleProof
        ],
      })

      const formattedAmount = isEligibleData.amount
        ? `${formatTokenAmount(new Fraction(isEligibleData.amount, 10 ** tokenToClaim.decimals))} ${tokenToClaim.symbol}`
        : `0,0 ${tokenToClaim.symbol}`

      return {
        ...isEligibleData,
        isClaimed,
        callData,
        contractAddress: tokenToClaimData.address,
        token: tokenToClaim,
        formattedAmount,
      }
    },
    [config, tokenToClaimData, account, i18n],
  )

  return useSWR<IClaimData | undefined, Error>(
    tokenToClaimData && account
      ? {
          dataBaseUrl: tokenToClaimData.dataBaseUrl,
          address: account.toLowerCase(),
        }
      : null,
    fetchPreviewClaimableTokens,
    { errorRetryCount: 0 },
  )
}
