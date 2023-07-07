import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { metadataApiSDK } from 'cowSdk'

import { environmentName } from 'legacy/utils/environments'

import { UtmParams } from 'modules/utm'

import { AppDataOrderClass } from '../types'

export type BuildAppDataParams = {
  appCode: string
  chainId: SupportedChainId
  slippageBips: string
  orderClass: AppDataOrderClass
  referrerAccount?: string
  utm: UtmParams | undefined
}

export async function buildAppData({
  chainId,
  slippageBips,
  referrerAccount,
  appCode,
  orderClass,
  utm: utmParams,
}: BuildAppDataParams) {
  const referrerParams =
    referrerAccount && chainId === SupportedChainId.MAINNET ? { address: referrerAccount } : undefined

  const quoteParams = { slippageBips }
  const orderClassParams = { orderClass }

  const doc = await metadataApiSDK.generateAppDataDoc({
    appDataParams: { appCode, environment: environmentName },
    metadataParams: { referrerParams, quoteParams, orderClassParams, utmParams },
  })

  const calculatedAppData = await metadataApiSDK.calculateAppDataHash(doc)

  return { doc, calculatedAppData }
}
