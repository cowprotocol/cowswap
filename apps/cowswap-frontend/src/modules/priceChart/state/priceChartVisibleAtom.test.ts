import { createStore } from 'jotai'

import { tradeTypeAtom } from 'modules/trade'

import { TradeType } from 'common/modules/tradeNavigation'

import { priceChartVisibleAtom } from './priceChartVisibleAtom'

jest.mock('modules/trade', () => jest.requireActual('modules/trade/state/tradeTypeAtom'))
jest.mock('common/modules/tradeNavigation', () => jest.requireActual('common/modules/tradeNavigation/consts'))
jest.mock('@cowprotocol/core', () => jest.requireActual('../../../../../../libs/core/src/jotaiStore'))

function createChartStore(tradeType: TradeType): ReturnType<typeof createStore> {
  const store = createStore()
  setTradeType(store, tradeType)
  store.sub(priceChartVisibleAtom, () => undefined)
  return store
}

function setTradeType(store: ReturnType<typeof createStore>, tradeType: TradeType): void {
  store.set(tradeTypeAtom, { tradeType, route: '/:chainId?/swap/:inputCurrencyId?/:outputCurrencyId?' })
}

describe('priceChartVisibleAtom', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to off on Swap and on for the other trade types', () => {
    const store = createChartStore(TradeType.SWAP)
    expect(store.get(priceChartVisibleAtom)).toBe(false)

    for (const tradeType of [TradeType.LIMIT_ORDER, TradeType.ADVANCED_ORDERS, TradeType.YIELD]) {
      setTradeType(store, tradeType)
      expect(store.get(priceChartVisibleAtom)).toBe(true)
    }
  })

  it.each([true, false])('restores the saved Swap preference (%s)', (visible) => {
    const store = createChartStore(TradeType.SWAP)
    store.set(priceChartVisibleAtom, visible)

    expect(localStorage.getItem('swapPriceChartVisible:v0')).toBe(JSON.stringify(visible))
    expect(createChartStore(TradeType.SWAP).get(priceChartVisibleAtom)).toBe(visible)
  })

  it('keeps Swap toggles separate from Limit and TWAP across navigation', () => {
    const store = createChartStore(TradeType.SWAP)
    store.set(priceChartVisibleAtom, (visible) => !visible)

    setTradeType(store, TradeType.LIMIT_ORDER)
    store.set(priceChartVisibleAtom, false)
    setTradeType(store, TradeType.ADVANCED_ORDERS)
    expect(store.get(priceChartVisibleAtom)).toBe(false)

    setTradeType(store, TradeType.SWAP)
    expect(store.get(priceChartVisibleAtom)).toBe(true)
    store.set(priceChartVisibleAtom, (visible) => !visible)
    expect(store.get(priceChartVisibleAtom)).toBe(false)

    setTradeType(store, TradeType.LIMIT_ORDER)
    store.set(priceChartVisibleAtom, true)
    setTradeType(store, TradeType.SWAP)
    expect(store.get(priceChartVisibleAtom)).toBe(false)
  })

  it.each([true, false])('preserves the existing Limit and TWAP preference (%s)', (visible) => {
    localStorage.setItem('price-chart-visible:v0', JSON.stringify(visible))
    const store = createChartStore(TradeType.LIMIT_ORDER)
    expect(store.get(priceChartVisibleAtom)).toBe(visible)

    setTradeType(store, TradeType.ADVANCED_ORDERS)
    expect(store.get(priceChartVisibleAtom)).toBe(visible)
    setTradeType(store, TradeType.SWAP)
    expect(store.get(priceChartVisibleAtom)).toBe(false)
  })

  it('falls back to off if the saved Swap preference is invalid JSON', () => {
    localStorage.setItem('swapPriceChartVisible:v0', '{invalid')
    expect(createChartStore(TradeType.SWAP).get(priceChartVisibleAtom)).toBe(false)
  })
})
