import { orderBookApi } from 'cowSdk'

/**
 * Interface to upload appData document
 */
export type UploadAppDataDoc = (appDataKeccak256: string, fullAppData: string) => Promise<void>

/**
 * Upload appData document to orderbook API
 * 
 * @param appDataKeccak256 Keccak256 of the fullAppData passed as second parameter
 * @param fullAppData Full appData content to upload
 * 
 * @throws Throws in case the fullAppData and the appDataKeccak256 don't match

 */
export const uploadAppDataDocOrderbookApi: UploadAppDataDoc = async (appDataKeccak256, fullAppData) => {
  orderBookApi.uploadAppData(appDataKeccak256, fullAppData)
}
