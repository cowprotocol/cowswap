import { createStore } from 'jotai'

import { tradeTypeAtom } from 'modules/trade'

import { TradeType } from 'common/modules/tradeNavigation'

import { priceChartVisibleAtom } from './priceChartVisibleAtom'

jest.mock('modules/trade', () => jest.requireActual('modules/trade/state/tradeTypeAtom'))
jest.mock('common/modules/tradeNavigation', () => jest.requireActual('common/modules/tradeNavigation/consts'))
jest.mock('@cowprotocol/core', () => jest.requireActual('../../../../../../libs/core/src/jotaiStore'))

const TRADE_CHART_PREFERENCES = [
  [TradeType.SWAP, 'swapPriceChartVisible:v0', false],
  [TradeType.LIMIT_ORDER, 'limitPriceChartVisible:v0', true],
  [TradeType.ADVANCED_ORDERS, 'twapPriceChartVisible:v0', true],
  [TradeType.YIELD, 'yieldPriceChartVisible:v0', true],
] as const

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

  it.each(TRADE_CHART_PREFERENCES)('restores both saved choices for %s', (tradeType, storageKey) => {
    for (const visible of [true, false]) {
      const store = createChartStore(tradeType)
      store.set(priceChartVisibleAtom, visible)

      expect(localStorage.getItem(storageKey)).toBe(JSON.stringify(visible))
      expect(createChartStore(tradeType).get(priceChartVisibleAtom)).toBe(visible)
    }
  })

  it.each(TRADE_CHART_PREFERENCES)(
    'keeps %s toggles separate from every other mode',
    (tradeType, _key, defaultVisible) => {
      const store = createChartStore(tradeType)
      store.set(priceChartVisibleAtom, (visible) => !visible)

      for (const [otherTradeType, , otherDefaultVisible] of TRADE_CHART_PREFERENCES) {
        if (otherTradeType === tradeType) continue
        setTradeType(store, otherTradeType)
        expect(store.get(priceChartVisibleAtom)).toBe(otherDefaultVisible)
      }

      setTradeType(store, tradeType)
      expect(store.get(priceChartVisibleAtom)).toBe(!defaultVisible)
      expect(createChartStore(tradeType).get(priceChartVisibleAtom)).toBe(!defaultVisible)
    },
  )

  it.each([true, false])('preserves the existing Limit and TWAP preference (%s)', (visible) => {
    localStorage.setItem('price-chart-visible:v0', JSON.stringify(visible))
    const store = createChartStore(TradeType.LIMIT_ORDER)
    expect(store.get(priceChartVisibleAtom)).toBe(visible)

    setTradeType(store, TradeType.ADVANCED_ORDERS)
    expect(store.get(priceChartVisibleAtom)).toBe(visible)
    setTradeType(store, TradeType.SWAP)
    expect(store.get(priceChartVisibleAtom)).toBe(false)
  })

  it('keeps an existing shared preference unchanged when a mode is toggled', () => {
    localStorage.setItem('price-chart-visible:v0', 'false')
    const store = createChartStore(TradeType.LIMIT_ORDER)
    store.set(priceChartVisibleAtom, (visible) => !visible)
    expect(store.get(priceChartVisibleAtom)).toBe(true)

    setTradeType(store, TradeType.ADVANCED_ORDERS)
    expect(store.get(priceChartVisibleAtom)).toBe(false)
    expect(localStorage.getItem('price-chart-visible:v0')).toBe('false')
  })

  it.each(TRADE_CHART_PREFERENCES)(
    'falls back to the %s default for invalid JSON',
    (tradeType, storageKey, visible) => {
      localStorage.setItem(storageKey, '{invalid')
      expect(createChartStore(tradeType).get(priceChartVisibleAtom)).toBe(visible)
    },
  )

  it('keeps mode-specific choices ahead of the old shared preference', () => {
    localStorage.setItem('price-chart-visible:v0', 'false')
    localStorage.setItem('limitPriceChartVisible:v0', 'true')
    const store = createChartStore(TradeType.LIMIT_ORDER)
    expect(store.get(priceChartVisibleAtom)).toBe(true)

    setTradeType(store, TradeType.ADVANCED_ORDERS)
    expect(store.get(priceChartVisibleAtom)).toBe(false)
  })
})
