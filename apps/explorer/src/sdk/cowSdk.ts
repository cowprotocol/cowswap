import { useEffect } from 'react'

import { bungeeAffiliateCode, RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { isDev, isProd, isStaging } from '@cowprotocol/common-utils'
import {
  AbstractProviderAdapter,
  EvmChains,
  isEvmChain,
  OrderBookApi,
  setGlobalAdapter,
  SupportedChainId,
} from '@cowprotocol/cow-sdk'
import { AcrossBridgeProvider, BungeeBridgeProvider, NearIntentsBridgeProvider } from '@cowprotocol/sdk-bridging'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'

import { Chain, createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { lens } from 'viem/chains'

import { useNetworkId } from '../state/network'

/** Lens (chain 232); cow-sdk v8 typings omit `SupportedChainId.LENS`. */
const LENS_CHAIN_ID = 232 as const
const LENS_DEFAULT_RPC = 'https://rpc.lens.xyz'

/** Read-only signer for the explorer (no real funds at risk). */
const EXPLORER_SIGNER_KEY = '0xa50dc0f7fc051309434deb3b1c71e927dbb711759231d8ecbf630c85d94a42fe' as const

type ViemChainMapKey = EvmChains | typeof LENS_CHAIN_ID

export const cowSdkAdapter = new ViemAdapter({
  provider: createPublicClient({
    chain: VIEM_CHAINS[SupportedChainId.MAINNET],
    transport: http(RPC_URLS[SupportedChainId.MAINNET]),
  }),
}) as AbstractProviderAdapter

export const orderBookApi = new OrderBookApi()

const bungeeApiBase = getBungeeApiBase()

export const bungeeBridgeProvider = new BungeeBridgeProvider({
  apiOptions: {
    includeBridges: ['across', 'cctp', 'gnosis-native-bridge'],
    apiBaseUrl: bungeeApiBase ? `${bungeeApiBase}/api/v1/bungee` : undefined,
    manualApiBaseUrl: bungeeApiBase ? `${bungeeApiBase}/api/v1/bungee-manual` : undefined,
    affiliate: bungeeApiBase ? bungeeAffiliateCode : undefined,
  },
})

export const acrossBridgeProvider = new AcrossBridgeProvider()

export const nearIntentsBridgeProvider = new NearIntentsBridgeProvider({ apiKey: process.env.REACT_APP_NEAR_API_KEY })

export const knownBridgeProviders = [bungeeBridgeProvider, acrossBridgeProvider, nearIntentsBridgeProvider]

function getBungeeApiBase(): string | undefined {
  if (isProd || isDev || isStaging) {
    return 'https://backend.bungee.exchange'
  }

  return 'https://bff.barn.cow.fi/proxies/socket'
}

setGlobalAdapter(cowSdkAdapter)

const CHAINS: Record<ViemChainMapKey, Chain> = {
  ...VIEM_CHAINS,
  [LENS_CHAIN_ID]: lens,
}

export function CowSdkUpdater(): null {
  const chainId = useNetworkId()

  useEffect(() => {
    if (!chainId || !isEvmChain(chainId)) return

    setGlobalAdapter(
      new ViemAdapter({
        provider: createPublicClient({
          chain: CHAINS[chainId as ViemChainMapKey],
          transport: http(
            (chainId as number) === LENS_CHAIN_ID
              ? ((process.env['REACT_APP_NETWORK_URL_232'] as string | undefined) ?? LENS_DEFAULT_RPC)
              : RPC_URLS[chainId],
          ),
        }),
        signer: privateKeyToAccount(EXPLORER_SIGNER_KEY),
      }) as AbstractProviderAdapter,
    )
  }, [chainId])

  return null
}
