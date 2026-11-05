import { createStore } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  acknowledgeTokenWarningsAtom,
  getAcknowledgementKey,
  tokenWarningsAcknowledgementAtom,
} from './tokenWarningsAcknowledgementAtom'

const chainId = SupportedChainId.SOLANA
const mint = 'Kp7xR4mWq9TzLbN3vYc8HdUe2sFgJ6aPoXk1VnEipump'
const key = getAcknowledgementKey(chainId, mint)

function acknowledge(store: ReturnType<typeof createStore>, codes: string[]): void {
  store.set(acknowledgeTokenWarningsAtom, { chainId, address: mint, codes })
}

describe('acknowledgeTokenWarningsAtom', () => {
  it('stores the confirmed codes against the mint', () => {
    const store = createStore()

    acknowledge(store, ['FREEZE'])

    expect(store.get(tokenWarningsAcknowledgementAtom)[key]).toEqual(['FREEZE'])
  })

  it('adds a risk confirmed later without dropping the earlier one', () => {
    const store = createStore()

    acknowledge(store, ['FREEZE'])
    acknowledge(store, ['PERM_DEL'])

    expect(store.get(tokenWarningsAcknowledgementAtom)[key]).toEqual(['FREEZE', 'PERM_DEL'])
  })

  it('does not store a code twice', () => {
    const store = createStore()

    acknowledge(store, ['FREEZE'])
    acknowledge(store, ['FREEZE', 'PERM_DEL'])

    expect(store.get(tokenWarningsAcknowledgementAtom)[key]).toEqual(['FREEZE', 'PERM_DEL'])
  })

  it('ignores an empty confirmation rather than writing an entry', () => {
    const store = createStore()

    acknowledge(store, [])

    expect(store.get(tokenWarningsAcknowledgementAtom)).toEqual({})
  })

  it('keeps a confirmation on one mint away from another', () => {
    const store = createStore()
    const otherMint = 'So11111111111111111111111111111111111111112'

    acknowledge(store, ['FREEZE'])
    store.set(acknowledgeTokenWarningsAtom, { chainId, address: otherMint, codes: ['MINT'] })

    expect(store.get(tokenWarningsAcknowledgementAtom)[key]).toEqual(['FREEZE'])
    expect(store.get(tokenWarningsAcknowledgementAtom)[getAcknowledgementKey(chainId, otherMint)]).toEqual(['MINT'])
  })
})
