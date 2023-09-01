import { stringifyDeterministic } from '@cowprotocol/app-data'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { metadataApiSDK } from 'cowSdk'
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils'

import { environmentName } from 'legacy/utils/environments'

import { UtmParams } from 'modules/utm'

import { AppDataHooks, AppDataInfo, AppDataOrderClass, AppDataRootSchema } from '../types'

export type BuildAppDataParams = {
  appCode: string
  chainId: SupportedChainId
  slippageBips: string
  orderClass: AppDataOrderClass
  referrerAccount?: string
  utm: UtmParams | undefined
  hooks?: AppDataHooks
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
  orderClass: orderClassName,
  utm,
  hooks,
}: BuildAppDataParams): Promise<AppDataInfo> {
  const referrerParams =
    referrerAccount && chainId === SupportedChainId.MAINNET ? { address: referrerAccount } : undefined

  const quoteParams = { slippageBips }
  const orderClass = { orderClass: orderClassName }

  const doc = await metadataApiSDK.generateAppDataDoc({
    appCode,
    environment: environmentName,
    metadata: { referrer: referrerParams, quote: quoteParams, orderClass, utm, hooks },
  })

  const { fullAppData, appDataKeccak256 } = await generateAppDataFromDoc(doc)

  return { doc, fullAppData, appDataKeccak256 }
}

export function toKeccak256(fullAppData: string) {
  return keccak256(toUtf8Bytes(fullAppData))
}

export async function updateHooksOnAppData(appData: AppDataInfo, hooks: AppDataHooks | undefined): Promise<AppDataInfo> {
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
