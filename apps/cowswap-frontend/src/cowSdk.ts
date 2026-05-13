import { atom, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl, isBarnBackendEnv } from '@cowprotocol/common-utils'
import {
  AbstractProviderAdapter,
  DEFAULT_BACKOFF_OPTIONS,
  MetadataApi,
  OrderBookApi,
  Signer,
  setGlobalAdapter,
  ApiBaseUrls,
  SupportedChainId,
} from '@cowprotocol/cow-sdk'
import { PERMIT_ACCOUNT } from '@cowprotocol/permit-utils'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'

import { createPublicClient, http } from 'viem'
import { usePublicClient, useWalletClient } from 'wagmi'

const PROD_BASE_URL = 'https://api.cow.fi'

/**
 * An object containing *production* environment base URLs for each supported `chainId`.
 * @see {@link https://api.cow.fi/docs/#/}
 */
export const ORDER_BOOK_PROD_CONFIG: ApiBaseUrls = {
  [SupportedChainId.MAINNET]: `${PROD_BASE_URL}/mainnet`,
  [SupportedChainId.GNOSIS_CHAIN]: `${PROD_BASE_URL}/xdai`,
  [SupportedChainId.ARBITRUM_ONE]: `${PROD_BASE_URL}/arbitrum_one`,
  [SupportedChainId.BASE]: `${PROD_BASE_URL}/base`,
  [SupportedChainId.SEPOLIA]: `${PROD_BASE_URL}/sepolia`,
  [SupportedChainId.POLYGON]: `${PROD_BASE_URL}/polygon`,
  [SupportedChainId.AVALANCHE]: `${PROD_BASE_URL}/avalanche`,
  [SupportedChainId.BNB]: `${PROD_BASE_URL}/bnb`,
  [SupportedChainId.LINEA]: `${PROD_BASE_URL}/linea`,
  [SupportedChainId.PLASMA]: `${PROD_BASE_URL}/plasma`,
  [SupportedChainId.INK]: `${PROD_BASE_URL}/ink`,
}

const prodBaseUrls = process.env.REACT_APP_ORDER_BOOK_URLS
  ? JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS)
  : undefined

export const appSignerAtom = atom<Signer | undefined>(undefined)

setGlobalAdapter(
  new ViemAdapter({
    provider: createPublicClient({
      chain: VIEM_CHAINS[getCurrentChainIdFromUrl()],
      transport: http(RPC_URLS[getCurrentChainIdFromUrl()]),
    }),
  }) as AbstractProviderAdapter,
)

export const orderBookApi = new OrderBookApi({
  env: isBarnBackendEnv ? 'staging' : 'prod',
  ...(ORDER_BOOK_BASE_URLS ? { baseUrls: ORDER_BOOK_BASE_URLS } : undefined),
  backoffOpts: DEFAULT_BACKOFF_OPTIONS,
})

export const metadataApiSDK = new MetadataApi()

export function CowSdkUpdater(): null {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const setAppSigner = useSetAtom(appSignerAtom)

  useEffect(() => {
    if (!publicClient) return
    let adapter: ViemAdapter
    if (walletClient) {
      adapter = new ViemAdapter({ provider: publicClient, walletClient })
    } else {
      adapter = new ViemAdapter({ provider: publicClient, signer: PERMIT_ACCOUNT })
    }
    setGlobalAdapter(adapter as AbstractProviderAdapter)
    setAppSigner(walletClient ? adapter.signer : undefined)
  }, [publicClient, walletClient, setAppSigner])

  return null
}
