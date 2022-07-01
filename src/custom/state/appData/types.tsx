import { AppDataDoc, SupportedChainId } from '@cowprotocol/cow-sdk'

export type AppDataInfo = {
  doc?: AppDataDoc // in case of default hash, there's no doc
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
