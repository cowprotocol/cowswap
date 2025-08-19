import { useEffect } from 'react'

import { getRpcProvider } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl, isBarnBackendEnv } from '@cowprotocol/common-utils'
import { CowSdk, DEFAULT_BACKOFF_OPTIONS } from '@cowprotocol/cow-sdk'
import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

const chainId = getCurrentChainIdFromUrl()
const prodBaseUrls = process.env.REACT_APP_ORDER_BOOK_URLS
  ? JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS)
  : undefined

export const adapter = new EthersV5Adapter({
  provider: getRpcProvider(chainId)!,
})

export const cowSdk = new CowSdk({
  adapter,
  chainId,
  env: isBarnBackendEnv ? 'staging' : 'prod',
  orderBookOptions: {
    env: isBarnBackendEnv ? 'staging' : 'prod',
    ...(prodBaseUrls ? { baseUrls: prodBaseUrls } : undefined),
    backoffOpts: DEFAULT_BACKOFF_OPTIONS,
  },
})
export const metadataApiSDK = cowSdk.metadataApi
export const orderBookApi = cowSdk.orderBook

export function CowSdkUpdater(): null {
  const provider = useWalletProvider()

  useEffect(() => {
    const signer = provider?.getSigner()
    if (signer) {
      adapter.setSigner(signer)
    }
  }, [provider])

  return null
}
