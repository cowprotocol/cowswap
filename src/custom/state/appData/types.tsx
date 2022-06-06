import { AppDataDoc, SupportedChainId } from '@cowprotocol/cow-sdk'

export type AppDataInfo = {
  doc?: AppDataDoc // in case of default hash, there's no doc
  hash: string
}

type AppDataUploadStatus = {
  tryAfter?: number
  uploading: boolean
}

export type AppDataRecord = AppDataInfo & AppDataUploadStatus

export type AppDataPendingToUpload = Record<string, AppDataRecord>

export type AppDataKeyParams = {
  chainId: SupportedChainId
  orderId: string
}

export type AddAppDataToUploadQueueParams = AppDataKeyParams & {
  appData: AppDataInfo
}
export type UpdateAppDataOnUploadQueueParams = AppDataKeyParams & AppDataUploadStatus
export type RemoveAppDataFromUploadQueueParams = AppDataKeyParams

export type FlattenedAppDataFromUploadQueue = AppDataKeyParams & AppDataRecord
