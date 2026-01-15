import { useEffect } from 'react'

import { getRpcProvider, LAUNCH_DARKLY_VIEM_MIGRATION } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl, isBarnBackendEnv } from '@cowprotocol/common-utils'
import { DEFAULT_BACKOFF_OPTIONS, MetadataApi, OrderBookApi, setGlobalAdapter } from '@cowprotocol/cow-sdk'
import { PERMIT_ACCOUNT } from '@cowprotocol/permit-utils'
import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { useWeb3React } from '@web3-react/core'

import { usePublicClient, useWalletClient } from 'wagmi'

// import { useConnection } from 'wagmi'

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
  const { chainId, provider, account } = useWeb3React()

  useEffect(() => {
    if (!LAUNCH_DARKLY_VIEM_MIGRATION) return
    if (!publicClient) return
    if (walletClient) {
      setGlobalAdapter(new ViemAdapter({ provider: publicClient, walletClient }))
    } else {
      setGlobalAdapter(new ViemAdapter({ provider: publicClient, signer: PERMIT_ACCOUNT }))
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
