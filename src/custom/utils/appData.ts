import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { environmentName } from 'utils/environments'
import { OrderClass } from '@cowprotocol/cow-sdk'
import { metadataApiSDK } from '@cow/cowSdk'

export type BuildAppDataParams = {
  chainId: SupportedChainId
  slippageBips: string
  orderClass: OrderClass
  referrerAccount?: string
  appCode: string
}

export async function buildAppData({
  chainId,
  slippageBips,
  referrerAccount,
  appCode,
  orderClass,
}: BuildAppDataParams) {
  const referrerParams =
    referrerAccount && chainId === SupportedChainId.MAINNET ? { address: referrerAccount } : undefined

  const quoteParams = { slippageBips }
  const orderClassParams = { orderClass }

  const doc = await metadataApiSDK.generateAppDataDoc({
    appDataParams: { appCode, environment: environmentName },
    metadataParams: { referrerParams, quoteParams, orderClassParams },
  })

  const calculatedAppData = await metadataApiSDK.calculateAppDataHash(doc)

  return { doc, calculatedAppData }
}
