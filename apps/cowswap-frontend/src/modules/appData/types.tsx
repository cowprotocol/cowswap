import { LatestAppDataDocVersion, createOrderClassMetadata } from '@cowprotocol/app-data'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export type AppDataInfo = {
  doc: LatestAppDataDocVersion
  fullAppData: string
  appDataKeccak256: string
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
