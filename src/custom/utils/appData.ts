import { COW_SDK } from 'constants/index'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { environmentName } from 'utils/environments'
import { OrderClass } from 'state/orders/actions'

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
  const sdk = COW_SDK[chainId]

  const referrerParams =
    referrerAccount && chainId === SupportedChainId.MAINNET ? { address: referrerAccount } : undefined

  const quoteParams = { slippageBips }
  const orderClassParams = { orderClass }

  const doc = sdk.metadataApi.generateAppDataDoc({
    appDataParams: { appCode, environment: environmentName },
    metadataParams: { referrerParams, quoteParams, orderClassParams },
  })

  const calculatedAppData = await sdk.metadataApi.calculateAppDataHash(doc)

  return { doc, calculatedAppData }
}
