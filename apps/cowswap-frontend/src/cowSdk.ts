import { useEffect } from 'react'

import { getRpcProvider } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl, isBarnBackendEnv } from '@cowprotocol/common-utils'
import {
  AbstractProviderAdapter,
  DEFAULT_BACKOFF_OPTIONS,
  MetadataApi,
  OrderBookApi,
  setGlobalAdapter,
} from '@cowprotocol/cow-sdk'
import { PERMIT_ACCOUNT } from '@cowprotocol/permit-utils'
import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'

import { usePublicClient, useWalletClient } from 'wagmi'

const chainId = getCurrentChainIdFromUrl()
const prodBaseUrls = process.env.REACT_APP_ORDER_BOOK_URLS
  ? JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS)
  : undefined

const legacyAdapter = new EthersV5Adapter({
  provider: getRpcProvider(chainId)!,
})

setGlobalAdapter(legacyAdapter)

export const orderBookApi = new OrderBookApi({
  env: isBarnBackendEnv ? 'staging' : 'prod',
  ...(prodBaseUrls ? { baseUrls: prodBaseUrls } : undefined),
  backoffOpts: DEFAULT_BACKOFF_OPTIONS,
})

export const metadataApiSDK = new MetadataApi()

export function CowSdkUpdater(): null {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  useEffect(() => {
    if (!publicClient) return
    if (walletClient) {
      // TODO: fix the type casting
      setGlobalAdapter(new ViemAdapter({ provider: publicClient, walletClient }) as AbstractProviderAdapter)
    } else {
      setGlobalAdapter(new ViemAdapter({ provider: publicClient, signer: PERMIT_ACCOUNT }) as AbstractProviderAdapter)
    }
  }, [publicClient, walletClient])

  return null
}
