import { createStore, Provider } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { act, render } from '@testing-library/react'

import { BlockNumberUpdater } from './BlockNumberUpdater'

import { blockNumberByChainIdAtom } from '../state/blockNumberAtom'

let capturedOnBlockNumber: ((blockNumber: bigint) => void) | undefined
let mockChainId: number = SupportedChainId.MAINNET

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: () => ({ chainId: mockChainId }),
  useWatchChainBlockNumber: ({ onBlockNumber }: { onBlockNumber: (blockNumber: bigint) => void }) => {
    capturedOnBlockNumber = onBlockNumber
  },
}))

describe('BlockNumberUpdater', () => {
  beforeEach(() => {
    capturedOnBlockNumber = undefined
    mockChainId = SupportedChainId.MAINNET
  })

  it('writes observed block numbers to the atom for the active chain', () => {
    const store = createStore()
    render(
      <Provider store={store}>
        <BlockNumberUpdater />
      </Provider>,
    )

    act(() => capturedOnBlockNumber?.(123n))

    expect(store.get(blockNumberByChainIdAtom)[SupportedChainId.MAINNET]).toBe(123)
  })
})
