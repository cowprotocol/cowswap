import { UtmParams } from '@cowprotocol/common-utils'
import { stringifyDeterministic, SupportedChainId } from '@cowprotocol/cow-sdk'

import { metadataApiSDK } from 'cowSdk'

import { toKeccak256 } from 'common/utils/toKeccak256'

import { filterHooks, HooksFilter } from './appDataFilter'
import { removePermitHookFromHooks, typedAppDataHooksToAppDataHooks } from './typedHooks'

import { UserConsentsMetadata } from '../hooks/useRwaConsentForAppData'
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
  userConsent?: UserConsentsMetadata
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
  userConsent,
}: BuildAppDataParams): Promise<AppDataInfo> {
  const referrerParams = referrerAccount && chainId === SupportedChainId.MAINNET ? { code: referrerAccount } : undefined

  const quoteParams = {
    slippageBips,
    ...(isSmartSlippage !== undefined ? { smartSlippage: isSmartSlippage } : undefined),
  }
  const orderClass = { orderClass: orderClassName }
  const replacedOrder = replacedOrderUid ? { uid: replacedOrderUid } : undefined

  console.log('referrerParams', referrerParams)

  const doc = await metadataApiSDK.generateAppDataDoc({
    appCode,
    environment,
    metadata: {
      // TODO: fix it
      // referrer: referrerParams,
      quote: quoteParams,
      orderClass,
      utm,
      hooks: typedAppDataHooksToAppDataHooks(typedHooks),
      widget,
      partnerFee,
      ...{ replacedOrder },
      ...(userConsent ? userConsent : {}),
    },
  })

  const { fullAppData, appDataKeccak256 } = await generateAppDataFromDoc(doc)

  return { doc, fullAppData, appDataKeccak256 }
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
