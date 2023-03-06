import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { LatestAppDataDocVersion } from '@cowprotocol/app-data'

export type AppDataInfo = {
  doc?: LatestAppDataDocVersion // in case of default hash, there's no doc
  hash: string
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

export type AppDataPendingToUpload = Array<AppDataRecord>

export type AddAppDataToUploadQueueParams = AppDataKeyParams & {
  appData: AppDataInfo
}
export type UpdateAppDataOnUploadQueueParams = AppDataKeyParams & Partial<AppDataUploadStatus>
export type RemoveAppDataFromUploadQueueParams = AppDataKeyParams
