import { useEffect } from 'react'

import { getRpcProvider, LAUNCH_DARKLY_VIEM_MIGRATION } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl, isBarnBackendEnv } from '@cowprotocol/common-utils'
import {
  DEFAULT_BACKOFF_OPTIONS,
  MetadataApi,
  OrderBookApi,
  setGlobalAdapter,
  AbstractProviderAdapter,
  SupportedChainId,
  ApiBaseUrls,
} from '@cowprotocol/cow-sdk'
import { PERMIT_ACCOUNT } from '@cowprotocol/permit-utils'
import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { useWeb3React } from '@web3-react/core'

import { usePublicClient, useWalletClient } from 'wagmi'

const PROD_BASE_URL = 'https://api.cow.finance'

/**
 * An object containing *production* environment base URLs for each supported `chainId`.
 * @see {@link https://api.cow.finance/docs/#/}
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

const chainId = getCurrentChainIdFromUrl()
const prodBaseUrls = process.env.REACT_APP_ORDER_BOOK_URLS
  ? JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS)
  : ORDER_BOOK_PROD_CONFIG

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
