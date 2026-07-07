import { createStore } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { blockNumberByChainIdAtom, updateBlockNumberAtom } from './blockNumberAtom'

describe('updateBlockNumberAtom', () => {
  it('stores the block number for a chain', () => {
    const store = createStore()

    store.set(updateBlockNumberAtom, { chainId: SupportedChainId.MAINNET, blockNumber: 100 })

    expect(store.get(blockNumberByChainIdAtom)[SupportedChainId.MAINNET]).toBe(100)
  })

  it('updates only when the incoming block number is greater', () => {
    const store = createStore()

    store.set(updateBlockNumberAtom, { chainId: SupportedChainId.MAINNET, blockNumber: 100 })
    store.set(updateBlockNumberAtom, { chainId: SupportedChainId.MAINNET, blockNumber: 99 })
    expect(store.get(blockNumberByChainIdAtom)[SupportedChainId.MAINNET]).toBe(100)

    store.set(updateBlockNumberAtom, { chainId: SupportedChainId.MAINNET, blockNumber: 101 })
    expect(store.get(blockNumberByChainIdAtom)[SupportedChainId.MAINNET]).toBe(101)
  })

  it('tracks block numbers independently per chain', () => {
    const store = createStore()

    store.set(updateBlockNumberAtom, { chainId: SupportedChainId.MAINNET, blockNumber: 100 })
    store.set(updateBlockNumberAtom, { chainId: SupportedChainId.POLYGON, blockNumber: 5 })

    expect(store.get(blockNumberByChainIdAtom)).toEqual({
      [SupportedChainId.MAINNET]: 100,
      [SupportedChainId.POLYGON]: 5,
    })
  })
})
