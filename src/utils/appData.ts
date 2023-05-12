import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { environmentName } from 'utils/environments'
import { OrderClass } from '@cowprotocol/cow-sdk'
import { metadataApiSDK } from '@cow/cowSdk'
import { UtmParams } from '@cow/modules/utm'

export type BuildAppDataParams = {
  appCode: string
  chainId: SupportedChainId
  slippageBips: string
  orderClass: OrderClass
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
