import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { createInputChainsState, createOutputChainsState } from './useChainsToSelect'

import { createChainInfoForTests } from '../test-utils/createChainInfoForTests'

describe('useChainsToSelect state builders', () => {
  it('sorts sell-side chains using the canonical order', () => {
    const supportedChains = [
      createChainInfoForTests(SupportedChainId.AVALANCHE),
      createChainInfoForTests(SupportedChainId.BASE),
      createChainInfoForTests(SupportedChainId.MAINNET),
    ]

    const state = createInputChainsState(SupportedChainId.BASE, supportedChains)

    expect((state.chains ?? []).map((chain) => chain.id)).toEqual([
      SupportedChainId.MAINNET,
      SupportedChainId.BASE,
      SupportedChainId.AVALANCHE,
    ])
  })

  it('sorts bridge destination chains to match the canonical order', () => {
    const bridgeChains = [
      createChainInfoForTests(SupportedChainId.AVALANCHE),
      createChainInfoForTests(SupportedChainId.BASE),
      createChainInfoForTests(SupportedChainId.ARBITRUM_ONE),
      createChainInfoForTests(SupportedChainId.MAINNET),
    ]

    const state = createOutputChainsState({
      selectedTargetChainId: SupportedChainId.POLYGON,
      chainId: SupportedChainId.MAINNET,
      currentChainInfo: createChainInfoForTests(SupportedChainId.MAINNET),
      bridgeSupportedNetworks: bridgeChains,
      areUnsupportedChainsEnabled: true,
      isLoading: false,
    })

    expect((state.chains ?? []).map((chain) => chain.id)).toEqual([
      SupportedChainId.MAINNET,
      SupportedChainId.BASE,
      SupportedChainId.ARBITRUM_ONE,
      SupportedChainId.AVALANCHE,
    ])
  })

  it('falls back to wallet chain when bridge does not support the source chain', () => {
    const state = createOutputChainsState({
      selectedTargetChainId: SupportedChainId.BASE,
      chainId: SupportedChainId.SEPOLIA,
      currentChainInfo: createChainInfoForTests(SupportedChainId.SEPOLIA),
      bridgeSupportedNetworks: [
        createChainInfoForTests(SupportedChainId.MAINNET),
        createChainInfoForTests(SupportedChainId.ARBITRUM_ONE),
      ],
      areUnsupportedChainsEnabled: true,
      isLoading: false,
    })

    expect(state.defaultChainId).toBe(SupportedChainId.SEPOLIA)
    expect(state.chains?.map((chain) => chain.id)).toEqual([SupportedChainId.SEPOLIA])
  })
})
