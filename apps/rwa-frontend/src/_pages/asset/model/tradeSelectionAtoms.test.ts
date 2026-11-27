import { createStore } from 'jotai'

import { tradeSideAtom, tradeTokenKeyAtom } from './tradeSelectionAtoms'

const TOKEN_KEY = '1:0x00000000000000000000000000000000000000aa'

function mountedStore(): ReturnType<typeof createStore> {
  const store = createStore()
  store.sub(tradeSideAtom, () => undefined)
  store.sub(tradeTokenKeyAtom, () => undefined)

  return store
}

afterEach(() => window.localStorage.clear())

describe('trade selection atoms', () => {
  it('start with buy and the best quote', () => {
    const store = mountedStore()

    expect(store.get(tradeSideAtom)).toBe('buy')
    expect(store.get(tradeTokenKeyAtom)).toBeNull()
  })

  it('keep the picked side and token for the next page load', () => {
    const store = mountedStore()

    store.set(tradeSideAtom, 'sell')
    store.set(tradeTokenKeyAtom, TOKEN_KEY)
    const reloadedStore = mountedStore()

    expect(reloadedStore.get(tradeSideAtom)).toBe('sell')
    expect(reloadedStore.get(tradeTokenKeyAtom)).toBe(TOKEN_KEY)
  })

  it('fall back to buy and the best quote for unexpected stored values', () => {
    window.localStorage.setItem('rwaTradeSide:v1', JSON.stringify('short'))
    window.localStorage.setItem('rwaTradeTokenKey:v1', JSON.stringify(42))

    const store = mountedStore()

    expect(store.get(tradeSideAtom)).toBe('buy')
    expect(store.get(tradeTokenKeyAtom)).toBeNull()
  })

  it('do not follow a pick made in another tab', () => {
    const store = mountedStore()

    window.localStorage.setItem('rwaTradeSide:v1', JSON.stringify('sell'))
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'rwaTradeSide:v1',
        newValue: JSON.stringify('sell'),
        storageArea: window.localStorage,
      }),
    )

    expect(store.get(tradeSideAtom)).toBe('buy')
  })
})
