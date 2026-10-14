import { createStore } from 'jotai'

import { localForageJotai } from '@cowprotocol/core'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { waitFor } from '@testing-library/react'

import { setPartOrdersAtom, twapPartOrdersAtom, twapPartOrdersListAtom } from './twapPartOrdersAtom'

jest.mock('@cowprotocol/core', () => jest.requireActual('../../../../../../libs/core/src/jotaiStore'))
jest.mock('@cowprotocol/wallet', () => ({
  walletInfoAtom: jest.requireActual('jotai').atom({
    account: '0x1111111111111111111111111111111111111111',
    chainId: 42161,
  }),
}))
jest.mock(require.resolve('localforage', { paths: [require.resolve('@cowprotocol/core')] }), () => ({
  createInstance: () => ({
    getItem: jest.fn(async () =>
      JSON.stringify({
        parent: [
          { uid: 'part', safeAddress: '0x1111111111111111111111111111111111111111', chainId: 42161 },
          { uid: 'other-chain', safeAddress: '0x1111111111111111111111111111111111111111', chainId: 100 },
          { uid: 'other-owner', safeAddress: '0x2222222222222222222222222222222222222222', chainId: 42161 },
        ].map((part) => ({ ...part, isCreatedInOrderBook: false, isCancelling: false })),
      }),
    ),
    setItem: jest.fn(async () => undefined),
    removeItem: jest.fn(async () => undefined),
  }),
}))

it('exposes hydrated parts without a write, including when generation publishes unchanged parts', async () => {
  const store = createStore()
  const onChange = jest.fn()
  const unsubscribe = store.sub(twapPartOrdersListAtom, onChange)

  try {
    expect(store.get(twapPartOrdersListAtom)).toEqual([])
    const cached = await store.get(twapPartOrdersAtom)

    await waitFor(() => expect(store.get(twapPartOrdersListAtom).map((part) => part.uid)).toEqual(['part']))
    expect(onChange).toHaveBeenCalled()
    expect(localForageJotai.setItem).not.toHaveBeenCalled()

    const hydrated = store.get(twapPartOrdersListAtom)
    onChange.mockClear()
    await store.set(setPartOrdersAtom, cached)

    expect(store.get(twapPartOrdersListAtom)).toBe(hydrated)
    expect(onChange).not.toHaveBeenCalled()
    expect(localForageJotai.setItem).not.toHaveBeenCalled()

    store.set(walletInfoAtom, { account: '0x1111111111111111111111111111111111111111', chainId: 100 })
    expect(store.get(twapPartOrdersListAtom).map((part) => part.uid)).toEqual(['other-chain'])
  } finally {
    unsubscribe()
  }
})
