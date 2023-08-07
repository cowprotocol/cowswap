import { CowEnv, SupportedChainId } from '@cowprotocol/cow-sdk'

import { orderBookApi } from 'cowSdk'

/**
 * Interface to upload appData document
 */
export type UploadAppDataDoc = (props: UploadAppDataProps) => Promise<void>

export interface UploadAppDataProps {
  appDataKeccak256: string
  fullAppData: string
  chainId: SupportedChainId
  env?: CowEnv
}

/**
 * Upload appData document to orderbook API
 * 
 * @param appDataKeccak256 Keccak256 of the fullAppData passed as second parameter
 * @param fullAppData Full appData content to upload
 * 
 * @throws Throws in case the fullAppData and the appDataKeccak256 don't match

 */
export const uploadAppDataDocOrderbookApi: UploadAppDataDoc = async (props) => {
  const { appDataKeccak256, fullAppData, chainId, env } = props

  const contextOverride = env ? { chainId, env } : { chainId }
  orderBookApi.uploadAppData(appDataKeccak256, fullAppData, contextOverride)
}
