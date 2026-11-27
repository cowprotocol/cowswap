import { createStore } from 'jotai'

import { setPartOrdersAtom, twapPartOrdersAtom, type TwapPartOrderItem } from './twapPartOrdersAtom'

jest.mock('@cowprotocol/core', () => ({
  atomWithIdbStorage: (_key: string, initial: object) => jest.requireActual('jotai').atom(initial),
}))
jest.mock('@cowprotocol/wallet', () => ({ walletInfoAtom: {} }))

it('does not publish unchanged parts or reset cancellation and order-book flags', async () => {
  const store = createStore()
  const cached = { parent: [{ uid: 'part', isCreatedInOrderBook: true, isCancelling: true } as TwapPartOrderItem] }
  store.set(twapPartOrdersAtom, cached)
  const onChange = jest.fn()
  const unsubscribe = store.sub(twapPartOrdersAtom, onChange)

  await store.set(setPartOrdersAtom, {
    parent: [{ ...cached.parent[0], isCreatedInOrderBook: false, isCancelling: false }],
  })

  expect(store.get(twapPartOrdersAtom)).toBe(cached)
  expect(onChange).not.toHaveBeenCalled()

  await store.set(setPartOrdersAtom, { parent: [{ ...cached.parent[0], uid: 'new-part' }] })
  expect(onChange).toHaveBeenCalledTimes(1)
  expect((await store.get(twapPartOrdersAtom)).parent[0].uid).toBe('new-part')
  unsubscribe()
})
