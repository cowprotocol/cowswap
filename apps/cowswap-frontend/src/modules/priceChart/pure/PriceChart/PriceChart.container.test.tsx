import { createStore, Provider } from 'jotai'
import { PropsWithChildren, ReactNode } from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'

import { useUsdPrice } from 'modules/usdAmount'

import { PriceChart } from './PriceChart.container'
import { PriceChartPure } from './PriceChart.pure'
import { SimplePriceChartPure } from './SimplePriceChart.pure'

import { usePriceChartFeatureFlags } from '../../hooks/usePriceChartFeatureFlags'
import { loadMarketCapSupply } from '../../lib/loadPriceChartHistory.service'
import { getActivePriceLimitLinePrice, getSelectedPriceLimitRate } from '../../lib/priceLimitLine.utils'
import { createSwapChartSymbols } from '../../lib/symbolCatalog'
import { priceChartModeAtom } from '../../state/priceChartModeAtom'
import { priceChartSupplyBasisAtom } from '../../state/priceChartSupplyBasisAtom'

import type { PriceChartPureProps, PriceChartSymbolDescriptor } from '../../lib/tradingView.types'

jest.mock('modules/usdAmount', () => ({
  useUsdPrice: jest.fn(),
}))

jest.mock('./PriceChart.pure', () => ({
  PriceChartPure: jest.fn(() => <span>Advanced chart</span>),
}))

jest.mock('./SimplePriceChart.pure', () => ({
  SimplePriceChartPure: jest.fn(() => <span>Simple chart</span>),
}))

jest.mock('../../hooks/usePriceChartFeatureFlags', () => ({
  usePriceChartFeatureFlags: jest.fn(),
}))

jest.mock('../../lib/loadPriceChartHistory.service', () => ({
  loadMarketCapSupply: jest.fn(),
}))

jest.mock('../../lib/priceLimitLine.utils', () => ({
  getActivePriceLimitLinePrice: jest.fn(),
  getSelectedPriceLimitRate: jest.fn(),
}))

jest.mock('../../lib/symbolCatalog', () => ({
  createSwapChartSymbols: jest.fn(),
}))

jest.mock('../../lib/tradingViewPersistence.utils', () => ({
  loadSavedPriceChartSelection: () => 'sell',
  savePriceChartSelection: jest.fn(),
}))

const usePriceChartFeatureFlagsMock = usePriceChartFeatureFlags as jest.MockedFunction<typeof usePriceChartFeatureFlags>
const useUsdPriceMock = useUsdPrice as jest.MockedFunction<typeof useUsdPrice>
const createSwapChartSymbolsMock = jest.mocked(createSwapChartSymbols)
const getActivePriceLimitLinePriceMock = jest.mocked(getActivePriceLimitLinePrice)
const getSelectedPriceLimitRateMock = jest.mocked(getSelectedPriceLimitRate)
const loadMarketCapSupplyMock = jest.mocked(loadMarketCapSupply)
const priceChartPureMock = jest.mocked(PriceChartPure)
const simplePriceChartPureMock = jest.mocked(SimplePriceChartPure)

const SYMBOLS = [createSymbol('sell', '0xsell'), createSymbol('buy', '0xbuy')]

beforeEach(() => {
  createSwapChartSymbolsMock.mockReturnValue([])
})

describe('PriceChart feature gates', () => {
  beforeEach(() => {
    useUsdPriceMock.mockReturnValue(undefined)
  })

  it('does not mount chart dependencies when price charts are disabled', () => {
    usePriceChartFeatureFlagsMock.mockReturnValue({
      isAdvancedPriceChartEnabled: false,
      isPriceChartEnabled: false,
    })

    const { container } = render(<PriceChart inputCurrency={null} outputCurrency={null} />)

    expect(container.firstChild).toBeNull()
    expect(useUsdPriceMock).not.toHaveBeenCalled()
  })

  it('falls back to Simple without changing the persisted Advanced preference', () => {
    const store = createStore()
    store.set(priceChartModeAtom, 'advanced')
    usePriceChartFeatureFlagsMock.mockReturnValue({
      isAdvancedPriceChartEnabled: false,
      isPriceChartEnabled: true,
    })

    render(<PriceChart inputCurrency={null} outputCurrency={null} />, { wrapper: createWrapper(store) })

    expect(screen.getByText('Simple chart')).not.toBeNull()
    expect(store.get(priceChartModeAtom)).toBe('advanced')
  })

  it('restores Advanced when its flag is enabled', () => {
    const store = createStore()
    store.set(priceChartModeAtom, 'advanced')
    usePriceChartFeatureFlagsMock.mockReturnValue({
      isAdvancedPriceChartEnabled: true,
      isPriceChartEnabled: true,
    })

    render(<PriceChart inputCurrency={null} outputCurrency={null} />, { wrapper: createWrapper(store) })

    expect(screen.getByText('Advanced chart')).not.toBeNull()
  })
})

describe('PriceChart reference lines', () => {
  beforeEach(() => {
    usePriceChartFeatureFlagsMock.mockReturnValue({
      isAdvancedPriceChartEnabled: true,
      isPriceChartEnabled: true,
    })
    useUsdPriceMock.mockReturnValue(undefined)
    createSwapChartSymbolsMock.mockReturnValue(SYMBOLS)
    getActivePriceLimitLinePriceMock.mockReturnValue(2)
    loadMarketCapSupplyMock.mockResolvedValue(100)
  })

  it('keeps the reference price unchanged in Price mode', () => {
    renderChart()

    expect(getLatestProps(simplePriceChartPureMock).referenceLines).toEqual([
      { id: 'trade:test', label: 'Limit', price: 2, variant: 'trade' },
    ])
    expect(loadMarketCapSupplyMock).not.toHaveBeenCalled()
  })

  it('uses the label for the active chart token', () => {
    renderChart('simple', 'Sell WETH', 'circulating', { buy: 'Buy USDC', sell: 'Sell WETH' })

    expect(getLatestProps(simplePriceChartPureMock).referenceLines[0]?.label).toBe('Sell WETH')

    act(() => getLatestProps(simplePriceChartPureMock).onSelectSelection('buy'))
    expect(getLatestProps(simplePriceChartPureMock).referenceLines[0]?.label).toBe('Buy USDC')
  })

  it.each([
    ['simple', 'Limit'],
    ['advanced', 'Protection'],
  ] as const)('hides reference lines in %s Market Cap mode', async (mode, label) => {
    renderChart(mode, label)

    act(() => getLatestProps(getChartMock(mode)).onSelectMetric('marketCap'))

    await waitFor(() => {
      expect(getLatestProps(getChartMock(mode)).referenceLines).toEqual([])
      expect(getLatestProps(getChartMock(mode)).onSelectPrice).toBeDefined()
    })
    const selectPrice = getLatestProps(getChartMock(mode)).onSelectPrice

    expect(selectPrice).toBeDefined()
    act(() => selectPrice?.(1_000))
    expect(getSelectedPriceLimitRateMock).toHaveBeenLastCalledWith(SYMBOLS[0], null, null, 10, null, null)

    act(() => getLatestProps(getChartMock(mode)).onSelectMetric('price'))
    expect(getLatestProps(getChartMock(mode)).referenceLines).toEqual([
      { id: 'trade:test', label, price: 2, variant: 'trade' },
    ])
    expect(getLatestProps(getChartMock(mode)).onSelectPrice).toBeDefined()
  })

  it('hides the Market Cap reference line when circulating supply is unavailable', async () => {
    loadMarketCapSupplyMock.mockRejectedValue(new Error('Unavailable'))
    renderChart()

    act(() => getLatestProps(simplePriceChartPureMock).onSelectMetric('marketCap'))

    await waitFor(() => expect(loadMarketCapSupplyMock).toHaveBeenCalled())
    expect(getLatestProps(simplePriceChartPureMock).referenceLines).toEqual([])
    expect(getLatestProps(simplePriceChartPureMock).onSelectPrice).toBeUndefined()
  })

  it('ignores a stale supply response after changing the selected token', async () => {
    const sellSupply = deferred<number>()
    const buySupply = deferred<number>()
    loadMarketCapSupplyMock.mockImplementation((asset) =>
      asset.address === '0xsell' ? sellSupply.promise : buySupply.promise,
    )
    renderChart()

    act(() => getLatestProps(simplePriceChartPureMock).onSelectMetric('marketCap'))
    await waitFor(() => expect(loadMarketCapSupplyMock).toHaveBeenCalledWith(SYMBOLS[0].baseAsset, 'circulating'))

    act(() => getLatestProps(simplePriceChartPureMock).onSelectSelection('buy'))
    await waitFor(() => expect(loadMarketCapSupplyMock).toHaveBeenCalledWith(SYMBOLS[1].baseAsset, 'circulating'))

    await act(async () => sellSupply.resolve(100))
    expect(getLatestProps(simplePriceChartPureMock).onSelectPrice).toBeUndefined()

    await act(async () => buySupply.resolve(300))
    expect(getLatestProps(simplePriceChartPureMock).referenceLines).toEqual([])
    expect(getLatestProps(simplePriceChartPureMock).onSelectPrice).toBeDefined()
  })

  it('uses total supply for history, reference lines, and picking when selected', async () => {
    loadMarketCapSupplyMock.mockResolvedValue(200)
    renderChart('simple', 'Limit', 'total')

    act(() => getLatestProps(simplePriceChartPureMock).onSelectMetric('marketCap'))

    await waitFor(() => {
      expect(loadMarketCapSupplyMock).toHaveBeenCalledWith(SYMBOLS[0].baseAsset, 'total')
      expect(getLatestProps(simplePriceChartPureMock)).toMatchObject({
        referenceLines: [],
        supplyBasis: 'total',
      })
      expect(getLatestProps(simplePriceChartPureMock).onSelectPrice).toBeDefined()
    })

    act(() => getLatestProps(simplePriceChartPureMock).onSelectPrice?.(1_000))
    expect(getSelectedPriceLimitRateMock).toHaveBeenLastCalledWith(SYMBOLS[0], null, null, 5, null, null)
  })
})

function createSymbol(selection: 'sell' | 'buy', address: string): PriceChartSymbolDescriptor {
  return {
    baseAsset: { address, chainId: 1, symbol: selection.toUpperCase() },
    selection,
    ticker: `${selection.toUpperCase()}USD`,
  } as PriceChartSymbolDescriptor
}

function createWrapper(store: ReturnType<typeof createStore>): (props: PropsWithChildren) => ReactNode {
  return function Wrapper({ children }: PropsWithChildren): ReactNode {
    return <Provider store={store}>{children}</Provider>
  }
}

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })

  return { promise, resolve }
}

function getChartMock(mode: 'simple' | 'advanced'): jest.MockedFunction<(props: PriceChartPureProps) => ReactNode> {
  return mode === 'advanced' ? priceChartPureMock : simplePriceChartPureMock
}

function getLatestProps(mock: jest.MockedFunction<(props: PriceChartPureProps) => ReactNode>): PriceChartPureProps {
  const props = mock.mock.calls.at(-1)?.[0]

  if (!props) throw new Error('Chart was not rendered')

  return props
}

function renderChart(
  mode: 'simple' | 'advanced' = 'simple',
  label = 'Limit',
  supplyBasis: 'circulating' | 'total' = 'circulating',
  labels?: { buy: string; sell: string },
): void {
  const store = createStore()
  store.set(priceChartModeAtom, mode)
  store.set(priceChartSupplyBasisAtom, supplyBasis)

  render(
    <PriceChart
      inputCurrency={null}
      onSelectLimitPrice={jest.fn()}
      outputCurrency={null}
      referenceLines={[{ id: 'trade:test', label, labels, price: null, variant: 'trade' }]}
    />,
    { wrapper: createWrapper(store) },
  )
}
