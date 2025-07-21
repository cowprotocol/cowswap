import { useEffect } from 'react'

import { getRpcProvider } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl, isBarnBackendEnv } from '@cowprotocol/common-utils'
import { DEFAULT_BACKOFF_OPTIONS, MetadataApi, OrderBookApi, setGlobalAdapter } from '@cowprotocol/cow-sdk'
import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter'
import { useWeb3React } from '@web3-react/core'

const chainId = getCurrentChainIdFromUrl()

const envBaseUrls = process.env.REACT_APP_ORDER_BOOK_URLS && JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS)

// To manually set the order book URLs in localStorage, you can use the following command in the browser console:
// localStorage.setItem('orderBookUrls', JSON.stringify({ "1":"https://YOUR_HOST", "100":"https://YOUR_HOST" }))
// To clear it, simply run:
// localStorage.removeItem('orderBookUrls')
const localStorageBaseUrls =
  localStorage.getItem('orderBookUrls') && JSON.parse(localStorage.getItem('orderBookUrls') || '{}')

const prodBaseUrls = envBaseUrls || localStorageBaseUrls || undefined

console.log('Order Book URLs:', prodBaseUrls, !!envBaseUrls, !!localStorageBaseUrls)

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
