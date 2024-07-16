import { stringifyDeterministic } from '@cowprotocol/app-data'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowHook } from '@cowprotocol/types'

import { metadataApiSDK } from 'cowSdk'
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils'

import { UtmParams } from 'modules/utm'

import { filterHooks, HooksFilter } from './appDataFilter'

import {
  AppDataHooks,
  AppDataInfo,
  AppDataOrderClass,
  AppDataPartnerFee,
  AppDataRootSchema,
  AppDataWidget,
  OrderInteractionHooks,
  PostHooks,
  PreHooks,
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
  hooks: AppDataHooks | undefined,
  preHooksFilter?: HooksFilter,
  postHooksFilter?: HooksFilter
): Promise<AppDataInfo> {
  const { doc } = appData

  const existingHooks = filterHooks(doc.metadata.hooks, preHooksFilter, postHooksFilter)

  const mergedHooks = mergeHooks(existingHooks, hooks)
  const noDuplicateHooks = mergedHooks
    ? {
        ...mergedHooks,
        ...(mergedHooks.pre ? { pre: removeDuplicatedHook(mergedHooks.pre) } : undefined),
        ...(mergedHooks.post ? { post: removeDuplicatedHook(mergedHooks.post) } : undefined),
      }
    : mergedHooks

  console.log(`bug:updateHooksOnAppData`, noDuplicateHooks)

  const newDoc = {
    ...doc,
    metadata: {
      ...doc.metadata,
      hooks: noDuplicateHooks,
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

function mergeHooks(
  hooks1: OrderInteractionHooks | undefined,
  hooks2: OrderInteractionHooks | undefined
): OrderInteractionHooks | undefined {
  if (hooks1 && !hooks2) return hooks1

  if (!hooks1 && hooks2) return hooks2

  if (hooks1 && hooks2) {
    const pre = (hooks1.pre || []).concat(hooks2.pre || [])
    const post = (hooks1.post || []).concat(hooks2.post || [])

    if (!pre && !post) {
      // Avoid empty hooks
      console.log(`bug:mergeHooks empty pre and post`, hooks1, hooks2)
      return undefined
    }

    console.log(`bug:mergeHooks has either pre, post or both`, hooks1, hooks2, pre, post)

    return {
      version: hooks1.version,
      // Remove the ones that are empty here too
      ...(pre ? { pre } : undefined),
      ...(post ? { post } : undefined),
    }
  }

  return undefined
}

function removeDuplicatedHook<T extends PreHooks | PostHooks>(hooks: T | undefined): T | undefined {
  if (!hooks || hooks.length < 2) {
    console.log(`bug:removeDuplicatedHook no hooks or only 1`, hooks?.length)
    return hooks
  }

  const duplicatedIndices: Set<number> = new Set()

  // Check all hooks against each other to identify duplicates
  for (let i = 0; i < hooks.length; i++) {
    if (duplicatedIndices.has(i)) {
      console.log(`bug:removeDuplicatedHook skipping duplicate`, i)
      continue
    }

    const hookA = hooks[i]

    for (let j = i + 1; j < hooks.length; j++) {
      const hookB = hooks[j]

      if (hooksAreEqual(hookA, hookB)) {
        console.log(`bug:removeDuplicatedHook found duplicate`, hookB)
        duplicatedIndices.add(j)
      }
    }
  }

  return duplicatedIndices.size ? (hooks.filter((hook, index) => !duplicatedIndices.has(index)) as T) : hooks
}

function hooksAreEqual(hookA: CowHook, hookB: CowHook): boolean {
  return (
    hookA.callData.toLowerCase() === hookB.callData.toLowerCase() &&
    hookA.target.toLowerCase() === hookB.target.toLowerCase()
  )
}
