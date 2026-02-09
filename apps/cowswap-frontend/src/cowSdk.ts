import { useEffect } from 'react'

import { getRpcProvider, LAUNCH_DARKLY_VIEM_MIGRATION } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl, isBarnBackendEnv } from '@cowprotocol/common-utils'
import {
  DEFAULT_BACKOFF_OPTIONS,
  MetadataApi,
  OrderBookApi,
  setGlobalAdapter,
  AbstractProviderAdapter,
} from '@cowprotocol/cow-sdk'
import { PERMIT_ACCOUNT } from '@cowprotocol/permit-utils'
import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { useWeb3React } from '@web3-react/core'

import { usePublicClient, useWalletClient } from 'wagmi'

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
  const { chainId, provider, account } = useWeb3React()

  useEffect(() => {
    if (!LAUNCH_DARKLY_VIEM_MIGRATION) return
    if (!publicClient) return
    if (walletClient) {
      // TODO: fix the type casting
      setGlobalAdapter(new ViemAdapter({ provider: publicClient, walletClient }) as AbstractProviderAdapter)
    } else {
      setGlobalAdapter(new ViemAdapter({ provider: publicClient, signer: PERMIT_ACCOUNT }) as AbstractProviderAdapter)
    }
  }, [publicClient, walletClient])

  useEffect(() => {
    if (LAUNCH_DARKLY_VIEM_MIGRATION) return
    if (!provider) return
    legacyAdapter.setProvider(provider)
    legacyAdapter.setSigner(provider.getSigner())
  }, [chainId, account, provider])

  return null
}
