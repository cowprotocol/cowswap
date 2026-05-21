import { atom, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl, isBarnBackendEnv } from '@cowprotocol/common-utils'
import {
  AbstractProviderAdapter,
  DEFAULT_BACKOFF_OPTIONS,
  EvmChains,
  isEvmChain,
  MetadataApi,
  OrderBookApi,
  Signer,
  setGlobalAdapter,
} from '@cowprotocol/cow-sdk'
import { PERMIT_ACCOUNT } from '@cowprotocol/permit-utils'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'

import { createPublicClient, http } from 'viem'
import { usePublicClient, useWalletClient } from 'wagmi'

const prodBaseUrls = process.env.REACT_APP_ORDER_BOOK_URLS
  ? JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS)
  : undefined

export const appSignerAtom = atom<Signer | undefined>(undefined)

function getInitialEvmChainId(): EvmChains {
  const urlChainId = getCurrentChainIdFromUrl()
  // viem doesn't support non-evm chains, so set default mainnet for global adapter
  return isEvmChain(urlChainId) ? urlChainId : EvmChains.MAINNET
}

const initialEvmChainId = getInitialEvmChainId()

setGlobalAdapter(
  new ViemAdapter({
    provider: createPublicClient({
      chain: VIEM_CHAINS[initialEvmChainId],
      transport: http(RPC_URLS[initialEvmChainId]),
    }),
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
