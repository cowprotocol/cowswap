import { useEffect } from 'react'

import { getRpcProvider } from '@cowprotocol/common-const'
import { OrderBookApi, setGlobalAdapter, SupportedChainId } from '@cowprotocol/cow-sdk'
import { AcrossBridgeProvider, BungeeBridgeProvider } from '@cowprotocol/sdk-bridging'
import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter'

import { useNetworkId } from '../state/network'


export const cowSdkAdapter = new EthersV5Adapter({
  provider: getRpcProvider(SupportedChainId.MAINNET)!,
})

export const orderBookApi = new OrderBookApi()

export const bungeeBridgeProvider = new BungeeBridgeProvider({
  apiOptions: {
    includeBridges: ['across', 'cctp', 'gnosis-native-bridge'],
  },
})

export const acrossBridgeProvider = new AcrossBridgeProvider()

export const knownBridgeProviders = [bungeeBridgeProvider, acrossBridgeProvider]

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
