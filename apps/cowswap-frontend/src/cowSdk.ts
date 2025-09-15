import { useEffect } from 'react'

import { getRpcProvider } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl, isBarnBackendEnv } from '@cowprotocol/common-utils'
import { DEFAULT_BACKOFF_OPTIONS, MetadataApi, OrderBookApi, setGlobalAdapter } from '@cowprotocol/cow-sdk'
import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter'
import { useWeb3React } from '@web3-react/core'

const chainId = getCurrentChainIdFromUrl()
const prodBaseUrls = process.env.REACT_APP_ORDER_BOOK_URLS
  ? JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS)
  : undefined

export const adapter = new EthersV5Adapter({
  provider: getRpcProvider(chainId)!,
})

setGlobalAdapter(adapter)

export const orderBookApi = new OrderBookApi({
  env: isBarnBackendEnv ? 'staging' : 'prod',
  ...(prodBaseUrls ? { baseUrls: prodBaseUrls } : undefined),
  backoffOpts: DEFAULT_BACKOFF_OPTIONS,
})

export const metadataApiSDK = new MetadataApi()

export function CowSdkUpdater(): null {
  const { chainId, provider, account } = useWeb3React()

  useEffect(() => {
    if (!provider) return
    adapter.setProvider(provider)
    adapter.setSigner(provider.getSigner())
  }, [chainId, account, provider])

  return null
}
