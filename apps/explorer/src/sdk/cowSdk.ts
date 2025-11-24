import { useEffect } from 'react'

import { bungeeAffiliateCode, getRpcProvider } from '@cowprotocol/common-const'
import { isBarn, isDev, isProd, isStaging } from '@cowprotocol/common-utils'
import { OrderBookApi, setGlobalAdapter, SupportedChainId } from '@cowprotocol/cow-sdk'
import { AcrossBridgeProvider, BungeeBridgeProvider, NearIntentsBridgeProvider } from '@cowprotocol/sdk-bridging'
import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter'

import { useNetworkId } from '../state/network'

export const cowSdkAdapter = new EthersV5Adapter({
  provider: getRpcProvider(SupportedChainId.MAINNET)!,
})

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

const nearIntentsBridgeProvider = new NearIntentsBridgeProvider()

export const knownBridgeProviders = [bungeeBridgeProvider, acrossBridgeProvider, nearIntentsBridgeProvider]

function getBungeeApiBase(): string | undefined {
  if (isProd || isDev || isStaging || isBarn) {
    return 'https://backend.bungee.exchange'
  }

  return 'https://bff.barn.cow.fi/proxies/socket'
}

setGlobalAdapter(cowSdkAdapter)

export function CowSdkUpdater(): null {
  const chainId = useNetworkId()

  useEffect(() => {
    if (!chainId) return

    const provider = getRpcProvider(chainId)
    if (provider) {
      cowSdkAdapter.setProvider(provider)
      cowSdkAdapter.setSigner(provider.getSigner())
    }
  }, [chainId])

  return null
}
