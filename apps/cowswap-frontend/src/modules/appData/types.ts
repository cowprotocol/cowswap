import { latest, LatestAppDataDocVersion } from '@cowprotocol/app-data'
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

export type AppDataMetadataOrderClass = latest.OrderClass
export type AppDataOrderClass = latest.OrderClass['orderClass']

export type AppDataPendingToUpload = Array<AppDataRecord>

export type UploadAppDataParams = AppDataKeyParams & {
  appData: AppDataInfo
}
export type UpdateAppDataOnUploadQueueParams = AppDataKeyParams & Partial<AppDataUploadStatus>
export type RemoveAppDataFromUploadQueueParams = AppDataKeyParams

export type CowHook = latest.CoWHook

export type TypedCowHook = CowHook & {
  type: 'permit' | 'hookStore'
}

export type AppDataHooks = latest.OrderInteractionHooks

export type TypedAppDataHooks = Omit<AppDataHooks, 'pre' | 'post'> & {
  pre?: TypedCowHook[]
  post?: TypedCowHook[]
}

export type PreHooks = latest.PreHooks

export type PostHooks = latest.PostHooks

export type AppDataRootSchema = latest.AppDataRootSchema

export type AppDataWidget = latest.Widget

export type AppDataPartnerFee = latest.PartnerFee

export type OrderInteractionHooks = latest.OrderInteractionHooks
