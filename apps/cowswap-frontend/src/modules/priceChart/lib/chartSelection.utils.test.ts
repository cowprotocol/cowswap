import { loadSavedChartPair, saveChartPair } from './chartSelection.utils'

const SELECTION_STORAGE_KEY = 'priceChartSelection:v0'
const LEGACY_FORMAT_STORAGE_KEY = 'priceChartFormat:v0'

describe('chartSelection.utils', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it.each(['sell-usd', 'buy-usd'] as const)('saves and loads %s', (pair) => {
    saveChartPair(pair)

    expect(loadSavedChartPair()).toBe(pair)
  })

  it.each([
    ['sell', 'sell-usd'],
    ['buy', 'buy-usd'],
  ])('migrates the saved %s side to %s', (side, pair) => {
    window.localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(side))

    expect(loadSavedChartPair()).toBe(pair)
    expect(window.localStorage.getItem(SELECTION_STORAGE_KEY)).toBe(JSON.stringify(pair))
  })

  it('drops a malformed saved selection', () => {
    window.localStorage.setItem(SELECTION_STORAGE_KEY, '{broken json')

    expect(loadSavedChartPair()).toBeUndefined()
    expect(window.localStorage.getItem(SELECTION_STORAGE_KEY)).toBeNull()
  })

  it('drops an unsupported saved selection', () => {
    window.localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify('other'))

    expect(loadSavedChartPair()).toBeUndefined()
    expect(window.localStorage.getItem(SELECTION_STORAGE_KEY)).toBeNull()
  })

  it.each([
    [1, 'sell-usd'],
    [2, 'buy-usd'],
  ])('migrates legacy format %s to %s', (format, pair) => {
    window.localStorage.setItem(LEGACY_FORMAT_STORAGE_KEY, JSON.stringify(format))

    expect(loadSavedChartPair()).toBe(pair)
    expect(window.localStorage.getItem(LEGACY_FORMAT_STORAGE_KEY)).toBeNull()
    expect(window.localStorage.getItem(SELECTION_STORAGE_KEY)).toBe(JSON.stringify(pair))
  })

  it('drops obsolete legacy chart formats', () => {
    window.localStorage.setItem(LEGACY_FORMAT_STORAGE_KEY, JSON.stringify(3))

    expect(loadSavedChartPair()).toBeUndefined()
    expect(window.localStorage.getItem(LEGACY_FORMAT_STORAGE_KEY)).toBeNull()
  })
})
