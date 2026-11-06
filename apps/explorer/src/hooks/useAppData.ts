import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { AnyAppDataDocVersion, isSupportedChain } from '@cowprotocol/cow-sdk'

import { DEFAULT_IPFS_READ_URI, IPFS_INVALID_APP_IDS } from 'const'
import { metadataApiSDK, orderBookSDK } from 'cowSdk'
import { useEvmNetworkId } from 'state/network'
import useSWR, { SWRConfiguration } from 'swr'

import { decodeFullAppData } from '../utils/decodeFullAppData'

const SWR_OPTIONS: SWRConfiguration = {
  ...SWR_NO_REFRESH_OPTIONS,
  errorRetryCount: 0,
}

interface AppDataDecodingResult {
  isLoading: boolean
  appDataDoc: AnyAppDataDocVersion | undefined
  hasError: boolean
}

export const useAppData = (appData: string, fullAppData?: string): AppDataDecodingResult => {
  const chainId = useEvmNetworkId()
  // Old AppData use a different way to derive the CID (we know is old if fullAppData is not available)
  const isLegacyAppDataHex = fullAppData === undefined

  const {
    error: appDataError,
    isLoading: isAppDataLoading,
    data: appDataDocFromApi,
  } = useSWR(
    chainId && isSupportedChain(chainId) ? ['appDataFromApi', appData, chainId] : null,
    async ([_, appDataHash, chainId]) => {
      const response = await orderBookSDK.getAppData(appDataHash, { chainId })

      const { error, decodedAppData } = await getDecodedAppData(appData, isLegacyAppDataHex, response.fullAppData)

      if (error) throw error

      return decodedAppData
    },
    SWR_OPTIONS,
  )

  const {
    error,
    isLoading,
    data: appDataDoc,
  } = useSWR(
    ['getDecodedAppData', appData, fullAppData, isLegacyAppDataHex],
    async ([_, appData, fullAppData, isLegacyAppDataHex]) => {
      const { error, decodedAppData } = await getDecodedAppData(appData, isLegacyAppDataHex, fullAppData)

      if (error) throw error

      return decodedAppData || undefined
    },
    SWR_OPTIONS,
  )

  return {
    isLoading: isLoading || isAppDataLoading,
    hasError: !!(appDataError && error),
    appDataDoc: appDataDocFromApi || appDataDoc,
  }
}

export const fetchDocFromAppDataHex = (
  appDataHex: string,
  isLegacyAppDataHex: boolean,
): Promise<void | AnyAppDataDocVersion> => {
  const method = isLegacyAppDataHex ? 'fetchDocFromAppDataHexLegacy' : 'fetchDocFromAppDataHex'
  return metadataApiSDK[method](appDataHex, DEFAULT_IPFS_READ_URI)
}

async function getDecodedAppData(
  appData: string,
  isLegacyAppDataHex: boolean,
  fullAppData?: string,
): Promise<{ decodedAppData?: void | AnyAppDataDocVersion; error?: Error }> {
  // If the full appData is available, we try to parse it as JSON
  if (fullAppData) {
    try {
      const decodedAppData = decodeFullAppData(fullAppData, true)
      return { decodedAppData }
    } catch (error) {
      console.error('Error parsing fullAppData from the API', { fullAppData }, error)
      return { error }
    }
  }

  if (IPFS_INVALID_APP_IDS.includes(appData.toString())) {
    return { error: new Error('Invalid app id') }
  }

  const decodedAppData = await fetchDocFromAppDataHex(appData.toString(), isLegacyAppDataHex)
  return { decodedAppData }
}
