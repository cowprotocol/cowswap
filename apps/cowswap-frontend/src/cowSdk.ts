import { useEffect } from 'react'

import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import {
  AbstractProviderAdapter,
  DEFAULT_BACKOFF_OPTIONS,
  MetadataApi,
  OrderBookApi,
  setGlobalAdapter,
} from '@cowprotocol/cow-sdk'
import { PERMIT_ACCOUNT } from '@cowprotocol/permit-utils'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'

import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { usePublicClient, useWalletClient } from 'wagmi'
const prodBaseUrls = process.env.REACT_APP_ORDER_BOOK_URLS
  ? JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS)
  : undefined

setGlobalAdapter(
  new ViemAdapter({
    provider: createPublicClient({ chain: mainnet, transport: http(mainnet.rpcUrls.default.http[0]) }),
  }) as AbstractProviderAdapter,
)

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
