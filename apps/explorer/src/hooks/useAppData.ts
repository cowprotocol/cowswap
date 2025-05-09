import { AnyAppDataDocVersion } from '@cowprotocol/app-data'

import { DEFAULT_IPFS_READ_URI, IPFS_INVALID_APP_IDS } from 'const'
import { metadataApiSDK, orderBookSDK } from 'cowSdk'
import useSWR from 'swr'

import { decodeFullAppData } from '../utils/decodeFullAppData'

interface AppDataDecodingResult {
  isLoading: boolean
  appDataDoc: AnyAppDataDocVersion | undefined
  hasError: boolean
  ipfsUri: string | undefined
}

export const useAppData = (appData: string, fullAppData?: string): AppDataDecodingResult => {
  // Old AppData use a different way to derive the CID (we know is old if fullAppData is not available)
  const isLegacyAppDataHex = fullAppData === undefined

  const {
    error: ipfsError,
    isLoading: isIpfsLoading,
    data: ipfsUri,
  } = useSWR(['appDataHexToCid', appData, isLegacyAppDataHex], async ([_, appData, isLegacyAppDataHex]) => {
    const cid = await appDataHexToCid(appData.toString(), isLegacyAppDataHex)

    return `${DEFAULT_IPFS_READ_URI}/${cid}`
  })

  const {
    error: appDataError,
    isLoading: isAppDataLoading,
    data: appDataDocFromApi,
  } = useSWR(['appDataFromApi', appData], async ([_, appDataHash]) => {
    const response = await orderBookSDK.getAppData(appDataHash)

    const { error, decodedAppData } = await getDecodedAppData(appData, isLegacyAppDataHex, response.fullAppData)

    if (error) throw error

    return decodedAppData
  })

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
  )

  return {
    isLoading: isLoading || isIpfsLoading || isAppDataLoading,
    hasError: !!(appDataError && (ipfsError || error)),
    appDataDoc: appDataDocFromApi || appDataDoc,
    ipfsUri,
  }
}

export const fetchDocFromAppDataHex = (
  appDataHex: string,
  isLegacyAppDataHex: boolean,
): Promise<void | AnyAppDataDocVersion> => {
  const method = isLegacyAppDataHex ? 'fetchDocFromAppDataHexLegacy' : 'fetchDocFromAppDataHex'
  return metadataApiSDK[method](appDataHex, DEFAULT_IPFS_READ_URI)
}

export const appDataHexToCid = (appDataHash: string, isLegacyAppDataHex: boolean): Promise<string | void> => {
  const method = isLegacyAppDataHex ? 'appDataHexToCidLegacy' : 'appDataHexToCid'
  return metadataApiSDK[method](appDataHash)
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
