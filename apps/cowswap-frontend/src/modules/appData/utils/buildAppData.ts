import { stringifyDeterministic } from '@cowprotocol/app-data'
import { UtmParams } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { metadataApiSDK } from 'cowSdk'
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils'

import { filterHooks, HooksFilter } from './appDataFilter'
import { removePermitHookFromHooks, typedAppDataHooksToAppDataHooks } from './typedHooks'

import {
  AppDataHooks,
  AppDataInfo,
  AppDataOrderClass,
  AppDataPartnerFee,
  AppDataRootSchema,
  AppDataWidget,
  TypedAppDataHooks,
} from '../types'

export type BuildAppDataParams = {
  appCode: string
  environment?: string
  chainId: SupportedChainId
  slippageBips: number
  isSmartSlippage?: boolean
  orderClass: AppDataOrderClass
  referrerAccount?: string
  utm: UtmParams | undefined
  typedHooks?: TypedAppDataHooks
  widget?: AppDataWidget
  partnerFee?: AppDataPartnerFee
  replacedOrderUid?: string
}

async function generateAppDataFromDoc(
  doc: AppDataRootSchema,
): Promise<Pick<AppDataInfo, 'fullAppData' | 'appDataKeccak256'>> {
  const fullAppData = await stringifyDeterministic(doc)
  const appDataKeccak256 = toKeccak256(fullAppData)
  return { fullAppData, appDataKeccak256 }
}

export async function buildAppData({
  chainId,
  slippageBips,
  isSmartSlippage,
  referrerAccount,
  appCode,
  environment,
  orderClass: orderClassName,
  utm,
  typedHooks,
  widget,
  partnerFee,
  replacedOrderUid,
}: BuildAppDataParams): Promise<AppDataInfo> {
  const referrerParams =
    referrerAccount && chainId === SupportedChainId.MAINNET ? { address: referrerAccount } : undefined

  const quoteParams = {
    slippageBips,
    ...(isSmartSlippage !== undefined ? { smartSlippage: isSmartSlippage } : undefined),
  }
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
      hooks: typedAppDataHooksToAppDataHooks(typedHooks),
      widget,
      partnerFee,
      ...{ replacedOrder },
    },
  })

  const { fullAppData, appDataKeccak256 } = await generateAppDataFromDoc(doc)

  return { doc, fullAppData, appDataKeccak256 }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function toKeccak256(fullAppData: string) {
  return keccak256(toUtf8Bytes(fullAppData))
}

export async function replaceHooksOnAppData(
  appData: AppDataInfo,
  hooks: AppDataHooks | undefined,
  preHooksFilter?: HooksFilter,
  postHooksFilter?: HooksFilter,
): Promise<AppDataInfo> {
  const { doc } = appData

  const filteredHooks = filterHooks(hooks, preHooksFilter, postHooksFilter)

  const newDoc = {
    ...doc,
    metadata: {
      ...doc.metadata,
      hooks: filteredHooks,
    },
  }

  if (!newDoc.metadata.hooks) {
    delete newDoc.metadata.hooks
  }

  const { fullAppData, appDataKeccak256 } = await generateAppDataFromDoc(newDoc)

  return {
    doc: newDoc,
    fullAppData,
    appDataKeccak256,
  }
}

export function removePermitHookFromAppData(
  appData: AppDataInfo,
  typedHooks: TypedAppDataHooks | undefined,
): Promise<AppDataInfo> {
  return replaceHooksOnAppData(appData, removePermitHookFromHooks(typedHooks))
}
