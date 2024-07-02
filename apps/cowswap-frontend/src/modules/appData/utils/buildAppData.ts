import { stringifyDeterministic } from '@cowprotocol/app-data'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { metadataApiSDK } from 'cowSdk'
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils'

import { UtmParams } from 'modules/utm'

import {
  AppDataHooks,
  AppDataInfo,
  AppDataOrderClass,
  AppDataPartnerFee,
  AppDataRootSchema,
  AppDataWidget,
} from '../types'

export type BuildAppDataParams = {
  appCode: string
  environment?: string
  chainId: SupportedChainId
  slippageBips: number
  orderClass: AppDataOrderClass
  referrerAccount?: string
  utm: UtmParams | undefined
  hooks?: AppDataHooks
  widget?: AppDataWidget
  partnerFee?: AppDataPartnerFee
  replacedOrderUid?: string
}

async function generateAppDataFromDoc(
  doc: AppDataRootSchema
): Promise<Pick<AppDataInfo, 'fullAppData' | 'appDataKeccak256'>> {
  const fullAppData = await stringifyDeterministic(doc)
  const appDataKeccak256 = toKeccak256(fullAppData)
  return { fullAppData, appDataKeccak256 }
}

export async function buildAppData({
  chainId,
  slippageBips,
  referrerAccount,
  appCode,
  environment,
  orderClass: orderClassName,
  utm,
  hooks,
  widget,
  partnerFee,
  replacedOrderUid,
}: BuildAppDataParams): Promise<AppDataInfo> {
  const referrerParams =
    referrerAccount && chainId === SupportedChainId.MAINNET ? { address: referrerAccount } : undefined

  const quoteParams = { slippageBips }
  const orderClass = { orderClass: orderClassName }
  const replacedOrder = replacedOrderUid ? { uid: replacedOrderUid } : undefined

  const doc = await metadataApiSDK.generateAppDataDoc({
    appCode,
    environment,
    metadata: {
      referrer: referrerParams,
      quote: quoteParams,
      orderClass,
      utm,
      hooks,
      widget,
      partnerFee,
      ...{ replacedOrder },
    },
  })

  const { fullAppData, appDataKeccak256 } = await generateAppDataFromDoc(doc)

  return { doc, fullAppData, appDataKeccak256 }
}

export function toKeccak256(fullAppData: string) {
  return keccak256(toUtf8Bytes(fullAppData))
}

export async function updateHooksOnAppData(
  appData: AppDataInfo,
  hooks: AppDataHooks | undefined
): Promise<AppDataInfo> {
  const { doc } = appData

  const newDoc = {
    ...doc,
    metadata: {
      ...doc.metadata,
      hooks,
    },
  }

  if (!hooks) {
    delete newDoc.metadata.hooks
  }

  const { fullAppData, appDataKeccak256 } = await generateAppDataFromDoc(newDoc)

  return {
    doc: newDoc,
    fullAppData,
    appDataKeccak256,
  }
}
