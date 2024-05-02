import { useEffect, useState } from 'react'

import { AnyAppDataDocVersion } from '@cowprotocol/app-data'

import { DEFAULT_IPFS_READ_URI } from 'const'
import { metadataApiSDK } from 'cowSdk'
import { useNetworkId } from 'state/network'

export const useAppData = (
  appDataHash: string,
  isLegacyAppDataHex: boolean,
): { isLoading: boolean; appDataDoc: AnyAppDataDocVersion | void | undefined } => {
  const network = useNetworkId() || undefined
  const [isLoading, setLoading] = useState<boolean>(false)
  const [appDataDoc, setAppDataDoc] = useState<AnyAppDataDocVersion | void>()
  useEffect(() => {
    async function getAppDataDoc(): Promise<void> {
      setLoading(true)
      try {
        const decodedAppData = await fetchDocFromAppDataHex(appDataHash, isLegacyAppDataHex)
        setAppDataDoc(decodedAppData)
      } catch (e) {
        const msg = `Failed to fetch appData document`
        console.error(msg, e)
      } finally {
        setLoading(false)
        setAppDataDoc(undefined)
      }
    }
    getAppDataDoc()
  }, [appDataHash, network, isLegacyAppDataHex])

  return { isLoading, appDataDoc }
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
