import {
  loadSavedPriceChartSelection,
  loadSavedPriceChartState,
  savePriceChartSelection,
  savePriceChartState,
} from './tradingViewPersistence.utils'

const STATE_STORAGE_KEY = 'priceChartState:v0'
const SELECTION_STORAGE_KEY = 'priceChartSelection:v0'
const LEGACY_FORMAT_STORAGE_KEY = 'priceChartFormat:v0'

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

  it('saves and loads the chart selection from local storage', () => {
    savePriceChartSelection('buy')

    expect(loadSavedPriceChartSelection()).toBe('buy')
  })

  it('drops a malformed saved selection', () => {
    window.localStorage.setItem(SELECTION_STORAGE_KEY, '{broken json')

    expect(loadSavedPriceChartSelection()).toBeUndefined()
    expect(window.localStorage.getItem(SELECTION_STORAGE_KEY)).toBeNull()
  })

  it('drops an unsupported saved selection', () => {
    window.localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify('other'))

    expect(loadSavedPriceChartSelection()).toBeUndefined()
    expect(window.localStorage.getItem(SELECTION_STORAGE_KEY)).toBeNull()
  })

  it('migrates the legacy numeric chart format', () => {
    window.localStorage.setItem(LEGACY_FORMAT_STORAGE_KEY, JSON.stringify(2))

    expect(loadSavedPriceChartSelection()).toBe('buy')
    expect(window.localStorage.getItem(LEGACY_FORMAT_STORAGE_KEY)).toBeNull()
    expect(window.localStorage.getItem(SELECTION_STORAGE_KEY)).toBe(JSON.stringify('buy'))
  })

  it('drops obsolete legacy chart formats', () => {
    window.localStorage.setItem(LEGACY_FORMAT_STORAGE_KEY, JSON.stringify(3))

    expect(loadSavedPriceChartSelection()).toBeUndefined()
    expect(window.localStorage.getItem(LEGACY_FORMAT_STORAGE_KEY)).toBeNull()
  })
})
