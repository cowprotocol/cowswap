import { cowAppDataLatestScheme, CowEnv, LatestAppDataDocVersion, SupportedChainId } from '@cowprotocol/cow-sdk'

export type AppDataHooks = cowAppDataLatestScheme.OrderInteractionHooks

export type AppDataInfo = {
  doc: LatestAppDataDocVersion
  fullAppData: string
  appDataKeccak256: string
  env?: CowEnv
}

export type AppDataKeyParams = {
  chainId: SupportedChainId
  orderId: string
}

export type AppDataMetadataOrderClass = cowAppDataLatestScheme.OrderClass

export type AppDataOrderClass = cowAppDataLatestScheme.OrderClass['orderClass']
export type AppDataPartnerFee = cowAppDataLatestScheme.PartnerFee

export type AppDataPendingToUpload = Array<AppDataRecord>

export type AppDataRecord = AppDataInfo & AppDataUploadStatus & AppDataKeyParams
export type AppDataRootSchema = cowAppDataLatestScheme.AppDataRootSchema
export type AppDataWidget = cowAppDataLatestScheme.Widget

export type CowHook = cowAppDataLatestScheme.CoWHook

export type OrderInteractionHooks = cowAppDataLatestScheme.OrderInteractionHooks

export type PostHooks = cowAppDataLatestScheme.PostHooks

export type PreHooks = cowAppDataLatestScheme.PreHooks

export type RemoveAppDataFromUploadQueueParams = AppDataKeyParams

export type TypedAppDataHooks = Omit<AppDataHooks, 'pre' | 'post'> & {
  pre?: TypedCowHook[]
  post?: TypedCowHook[]
}

export type TypedCowHook = CowHook & {
  type: 'permit' | 'hookStore'
}

export type UpdateAppDataOnUploadQueueParams = AppDataKeyParams & Partial<AppDataUploadStatus>

export type UploadAppDataParams = AppDataKeyParams & {
  appData: AppDataInfo
}

type AppDataUploadStatus = {
  lastAttempt?: number
  failedAttempts: number
  uploading: boolean
}
