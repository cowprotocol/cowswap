import { createStore } from 'jotai'

import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { addUnsupportedTokenAtom, unsupportedTokensAtom } from './unsupportedTokensAtom'

import { UnsupportedTokensState } from '../../types'

const chainId = SupportedChainId.MAINNET
const tokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const tokenKey = getAddressKey(tokenAddress)

function getEntry(store: ReturnType<typeof createStore>): UnsupportedTokensState[string] | undefined {
  return store.get(unsupportedTokensAtom)[chainId]?.[tokenKey]
}

describe('addUnsupportedTokenAtom', () => {
  it('stores the reason with the token', () => {
    const store = createStore()

    store.set(addUnsupportedTokenAtom, chainId, tokenAddress, 'Token-2022 transfer fee')

    expect(getEntry(store)).toEqual({
      dateAdded: expect.any(Number),
      reason: 'Token-2022 transfer fee',
    })
  })

  it('stores the token without a reason', () => {
    const store = createStore()

    store.set(addUnsupportedTokenAtom, chainId, tokenAddress)

    expect(getEntry(store)).toEqual({ dateAdded: expect.any(Number) })
  })

  it('updates the reason of an already added token and keeps its dateAdded', () => {
    const store = createStore()

    store.set(addUnsupportedTokenAtom, chainId, tokenAddress)
    const dateAdded = getEntry(store)?.dateAdded

    store.set(addUnsupportedTokenAtom, chainId, tokenAddress, 'Token-2022 transfer fee')

    expect(getEntry(store)).toEqual({
      dateAdded,
      reason: 'Token-2022 transfer fee',
    })
  })

  it('does not update state when the token is already stored with the same reason', () => {
    const store = createStore()

    store.set(addUnsupportedTokenAtom, chainId, tokenAddress, 'reason')
    const before = store.get(unsupportedTokensAtom)

    store.set(addUnsupportedTokenAtom, chainId, tokenAddress, 'reason')

    expect(store.get(unsupportedTokensAtom)).toBe(before)
  })
})
