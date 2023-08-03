import { LatestAppDataDocVersion, createOrderClassMetadata } from '@cowprotocol/app-data'
import { CowEnv, SupportedChainId } from '@cowprotocol/cow-sdk'

export type AppDataInfo = {
  doc: LatestAppDataDocVersion
  fullAppData: string
  appDataKeccak256: string
  env?: CowEnv
}

type AppDataUploadStatus = {
  lastAttempt?: number
  failedAttempts: number
  uploading: boolean
}

export type AppDataKeyParams = {
  chainId: SupportedChainId
  orderId: string
}

export type AppDataRecord = AppDataInfo & AppDataUploadStatus & AppDataKeyParams

export type AppDataOrderClass = Parameters<typeof createOrderClassMetadata>[0]['orderClass']

export type AppDataPendingToUpload = Array<AppDataRecord>

export type UploadAppDataParams = AppDataKeyParams & {
  appData: AppDataInfo
}
export type UpdateAppDataOnUploadQueueParams = AppDataKeyParams & Partial<AppDataUploadStatus>
export type RemoveAppDataFromUploadQueueParams = AppDataKeyParams
