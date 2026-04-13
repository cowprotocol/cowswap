import {
  loadSavedPriceChartFormat,
  loadSavedPriceChartState,
  savePriceChartFormat,
  savePriceChartState,
} from './tradingViewPersistence.utils'

const STATE_STORAGE_KEY = 'priceChartState:v0'
const FORMAT_STORAGE_KEY = 'priceChartFormat:v0'

describe('tradingViewPersistence.utils', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('saves and loads chart state from local storage', () => {
    const state = { charts: [{ panes: [] }], version: 1 }

    savePriceChartState(state)

    expect(loadSavedPriceChartState()).toEqual(state)
  })

  it('drops malformed local storage state', () => {
    window.localStorage.setItem(STATE_STORAGE_KEY, '{broken json')

    expect(loadSavedPriceChartState()).toBeUndefined()
    expect(window.localStorage.getItem(STATE_STORAGE_KEY)).toBeNull()
  })

  it('drops non-object local storage state', () => {
    window.localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify('bad'))

    expect(loadSavedPriceChartState()).toBeUndefined()
    expect(window.localStorage.getItem(STATE_STORAGE_KEY)).toBeNull()
  })

  it('saves and loads chart format from local storage', () => {
    savePriceChartFormat(4)

    expect(loadSavedPriceChartFormat()).toBe(4)
  })

  it('drops malformed local storage format', () => {
    window.localStorage.setItem(FORMAT_STORAGE_KEY, '{broken json')

    expect(loadSavedPriceChartFormat()).toBeUndefined()
    expect(window.localStorage.getItem(FORMAT_STORAGE_KEY)).toBeNull()
  })

  it('drops unsupported local storage format', () => {
    window.localStorage.setItem(FORMAT_STORAGE_KEY, JSON.stringify(7))

    expect(loadSavedPriceChartFormat()).toBeUndefined()
    expect(window.localStorage.getItem(FORMAT_STORAGE_KEY)).toBeNull()
  })
})
