import { atom, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { createPublicClient, http } from 'viem'
import { usePublicClient, useWalletClient } from 'wagmi'

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
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'

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

export const prodOrderBookApi = isBarnBackendEnv
  ? new OrderBookApi({
      env: 'prod',
      ...(prodBaseUrls ? { baseUrls: prodBaseUrls } : undefined),
      backoffOpts: DEFAULT_BACKOFF_OPTIONS,
    })
  : orderBookApi

export const metadataApiSDK = new MetadataApi()

export function CowSdkUpdater(): null {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const setAppSigner = useSetAtom(appSignerAtom)

  useEffect(() => {
    if (!publicClient) return

    // A WalletConnect session approved for Solana only (Ledger Live) leaves wagmi connected with no
    // eip155 account; the wallet client it resolves then has none, and ViemAdapter throws on that.
    if (!walletClient?.account) return

    const adapter = new ViemAdapter({ provider: publicClient, walletClient })
    setGlobalAdapter(adapter as AbstractProviderAdapter)
    setAppSigner(adapter.signer)
  }, [publicClient, walletClient, setAppSigner])

  return null
}

export function setBearerToken(token: string | null): void {
  if (token) {
    orderBookApi.context.bearerToken = token
  } else {
    delete orderBookApi.context.bearerToken
  }
}
