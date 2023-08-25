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

function generateAppDataFromDoc(doc: AppDataRootSchema) {
  const fullAppData = JSON.stringify(doc)
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

  const { fullAppData, appDataKeccak256 } = generateAppDataFromDoc(doc)

  return { doc, fullAppData, appDataKeccak256 }
}

export function toKeccak256(fullAppData: string) {
  return keccak256(toUtf8Bytes(fullAppData))
}

export function addHooksToAppData(appData: AppDataInfo, hooks: AppDataHooks): AppDataInfo {
  const { doc } = appData

  const newDoc = {
    ...doc,
    metadata: {
      ...doc.metadata,
      hooks,
    },
  }

  const { fullAppData, appDataKeccak256 } = generateAppDataFromDoc(newDoc)

  return {
    doc: newDoc,
    fullAppData,
    appDataKeccak256,
  }
}
