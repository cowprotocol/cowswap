import { COW_SDK } from 'constants/index'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { environmentName } from 'utils/environments'

export type BuildAppDataParams = {
  chainId: SupportedChainId
  slippageBips: string
  referrerAccount?: string
  appCode: string
}

export async function buildAppData({ chainId, slippageBips, referrerAccount, appCode }: BuildAppDataParams) {
  const sdk = COW_SDK[chainId]

  const referrerParams = referrerAccount ? { address: referrerAccount } : undefined

  const doc = sdk.metadataApi.generateAppDataDoc({
    appDataParams: { appCode, environment: environmentName },
    metadataParams: { referrerParams, quoteParams: { slippageBips } },
  })

  const calculatedAppData = await sdk.metadataApi.calculateAppDataHash(doc)

  return { doc, calculatedAppData }
}
