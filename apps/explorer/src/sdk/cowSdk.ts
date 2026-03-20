import { useEffect } from 'react'

import { bungeeAffiliateCode, RPC_URLS } from '@cowprotocol/common-const'
import { isBarn, isDev, isProd, isStaging } from '@cowprotocol/common-utils'
import { AbstractProviderAdapter, OrderBookApi, setGlobalAdapter, SupportedChainId } from '@cowprotocol/cow-sdk'
import { AcrossBridgeProvider, BungeeBridgeProvider, NearIntentsBridgeProvider } from '@cowprotocol/sdk-bridging'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'

import { Chain, createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import {
  arbitrum,
  avalanche,
  base,
  bsc,
  gnosis,
  ink,
  lens,
  linea,
  mainnet,
  plasma,
  polygon,
  sepolia,
} from 'viem/chains'

import { useNetworkId } from '../state/network'

export const cowSdkAdapter = new ViemAdapter({
  provider: createPublicClient({ chain: mainnet, transport: http(RPC_URLS[SupportedChainId.MAINNET]) }),
}) as AbstractProviderAdapter

export const orderBookApi = new OrderBookApi()

const bungeeApiBase = getBungeeApiBase()

const bungeeBridgeProvider = new BungeeBridgeProvider({
  apiOptions: {
    includeBridges: ['across', 'cctp', 'gnosis-native-bridge'],
    apiBaseUrl: bungeeApiBase ? `${bungeeApiBase}/api/v1/bungee` : undefined,
    manualApiBaseUrl: bungeeApiBase ? `${bungeeApiBase}/api/v1/bungee-manual` : undefined,
    affiliate: bungeeApiBase ? bungeeAffiliateCode : undefined,
  },
})

const acrossBridgeProvider = new AcrossBridgeProvider()

const nearIntentsBridgeProvider = new NearIntentsBridgeProvider({ apiKey: process.env.REACT_APP_NEAR_API_KEY })

export const knownBridgeProviders = [bungeeBridgeProvider, acrossBridgeProvider, nearIntentsBridgeProvider]

function getBungeeApiBase(): string | undefined {
  if (isProd || isDev || isStaging || isBarn) {
    return 'https://backend.bungee.exchange'
  }

  return 'https://bff.barn.cow.fi/proxies/socket'
}

setGlobalAdapter(cowSdkAdapter)

const CHAINS: Record<SupportedChainId, Chain> = {
  [SupportedChainId.MAINNET]: mainnet,
  [SupportedChainId.BNB]: bsc,
  [SupportedChainId.GNOSIS_CHAIN]: gnosis,
  [SupportedChainId.POLYGON]: polygon,
  [SupportedChainId.LENS]: lens,
  [SupportedChainId.BASE]: base,
  [SupportedChainId.PLASMA]: plasma,
  [SupportedChainId.ARBITRUM_ONE]: arbitrum,
  [SupportedChainId.AVALANCHE]: avalanche,
  [SupportedChainId.LINEA]: linea,
  [SupportedChainId.INK]: ink,
  [SupportedChainId.SEPOLIA]: sepolia,
}

export function CowSdkUpdater(): null {
  const chainId = useNetworkId()

  useEffect(() => {
    if (!chainId) return

    setGlobalAdapter(
      new ViemAdapter({
        provider: createPublicClient({ chain: CHAINS[chainId], transport: http(RPC_URLS[chainId]) }),
        signer: privateKeyToAccount('0xa50dc0f7fc051309434deb3b1c71e927dbb711759231d8ecbf630c85d94a42fe'),
      }) as AbstractProviderAdapter,
    )
  }, [chainId])

  return null
}
