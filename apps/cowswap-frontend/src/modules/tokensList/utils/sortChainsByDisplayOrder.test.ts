import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { sortChainsByDisplayOrder } from './sortChainsByDisplayOrder'

import { createChainInfoForTests } from '../test-utils/createChainInfoForTests'

describe('sortChainsByDisplayOrder', () => {
  it('orders chains according to the canonical network selector order', () => {
    const chains = [
      createChainInfoForTests(SupportedChainId.POLYGON),
      createChainInfoForTests(SupportedChainId.MAINNET),
      createChainInfoForTests(SupportedChainId.BNB),
    ]

    const result = sortChainsByDisplayOrder(chains)

    expect(result.map((chain) => chain.id)).toEqual([
      SupportedChainId.MAINNET,
      SupportedChainId.BNB,
      SupportedChainId.POLYGON,
    ])
  })

  it('keeps unknown chains at the end while preserving their relative order', () => {
    const customChainA = createChainInfoForTests(SupportedChainId.MAINNET, {
      id: 9991,
      label: 'Custom A',
      eip155Label: 'custom-a',
    })
    const customChainB = createChainInfoForTests(SupportedChainId.MAINNET, {
      id: 9992,
      label: 'Custom B',
      eip155Label: 'custom-b',
    })
    const chains = [
      customChainA,
      createChainInfoForTests(SupportedChainId.MAINNET),
      customChainB,
      createChainInfoForTests(SupportedChainId.BNB),
    ]

    const result = sortChainsByDisplayOrder(chains)

    expect(result.map((chain) => chain.id)).toEqual([
      SupportedChainId.MAINNET,
      SupportedChainId.BNB,
      customChainA.id,
      customChainB.id,
    ])
  })

  it('promotes the pinned chain to the first slot', () => {
    const chains = [
      createChainInfoForTests(SupportedChainId.MAINNET),
      createChainInfoForTests(SupportedChainId.BNB),
      createChainInfoForTests(SupportedChainId.POLYGON),
    ]

    const result = sortChainsByDisplayOrder(chains, { pinChainId: SupportedChainId.POLYGON })

    expect(result.map((chain) => chain.id)).toEqual([
      SupportedChainId.POLYGON,
      SupportedChainId.MAINNET,
      SupportedChainId.BNB,
    ])
  })
})
