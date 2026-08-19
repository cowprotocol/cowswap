import { createStore, Provider } from 'jotai'
import { PropsWithChildren, ReactNode } from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'

import { useUsdPrice } from 'modules/usdAmount'

import { PriceChart } from './PriceChart.container'
import { PriceChartPure } from './PriceChart.pure'
import { SimplePriceChartPure } from './SimplePriceChart.pure'

import { usePriceChartFeatureFlags } from '../../hooks/usePriceChartFeatureFlags'
import { loadCirculatingSupply } from '../../lib/loadPriceChartHistory.service'
import { getActivePriceLimitLinePrice } from '../../lib/priceLimitLine.utils'
import { createSwapChartSymbols } from '../../lib/symbolCatalog'
import { priceChartModeAtom } from '../../state/priceChartModeAtom'

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
  loadCirculatingSupply: jest.fn(),
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
const loadCirculatingSupplyMock = jest.mocked(loadCirculatingSupply)
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
    loadCirculatingSupplyMock.mockResolvedValue(100)
  })

  it('keeps the reference price unchanged in Price mode', () => {
    renderChart()

    expect(getLatestProps(simplePriceChartPureMock).referenceLine).toEqual({ label: 'Limit', price: 2 })
    expect(loadCirculatingSupplyMock).not.toHaveBeenCalled()
  })

  it.each([
    ['simple', 'Limit'],
    ['advanced', 'Protection'],
  ] as const)('scales the reference line in %s Market Cap mode', async (mode, label) => {
    renderChart(mode, label)

    act(() => getLatestProps(getChartMock(mode)).onSelectMetric('marketCap'))

    await waitFor(() => {
      expect(getLatestProps(getChartMock(mode)).referenceLine).toEqual({ label, price: 200 })
    })
    expect(getLatestProps(getChartMock(mode)).onSelectPrice).toBeUndefined()

    act(() => getLatestProps(getChartMock(mode)).onSelectMetric('price'))
    expect(getLatestProps(getChartMock(mode)).referenceLine).toEqual({ label, price: 2 })
    expect(getLatestProps(getChartMock(mode)).onSelectPrice).toBeDefined()
  })

  it('hides the Market Cap reference line when circulating supply is unavailable', async () => {
    loadCirculatingSupplyMock.mockRejectedValue(new Error('Unavailable'))
    renderChart()

    act(() => getLatestProps(simplePriceChartPureMock).onSelectMetric('marketCap'))

    await waitFor(() => expect(loadCirculatingSupplyMock).toHaveBeenCalled())
    expect(getLatestProps(simplePriceChartPureMock).referenceLine).toBeUndefined()
  })

  it('ignores a stale supply response after changing the selected token', async () => {
    const sellSupply = deferred<number>()
    const buySupply = deferred<number>()
    loadCirculatingSupplyMock.mockImplementation((asset) =>
      asset.address === '0xsell' ? sellSupply.promise : buySupply.promise,
    )
    renderChart()

    act(() => getLatestProps(simplePriceChartPureMock).onSelectMetric('marketCap'))
    await waitFor(() => expect(loadCirculatingSupplyMock).toHaveBeenCalledWith(SYMBOLS[0].baseAsset))

    act(() => getLatestProps(simplePriceChartPureMock).onSelectSelection('buy'))
    await waitFor(() => expect(loadCirculatingSupplyMock).toHaveBeenCalledWith(SYMBOLS[1].baseAsset))

    await act(async () => sellSupply.resolve(100))
    expect(getLatestProps(simplePriceChartPureMock).referenceLine).toBeUndefined()

    await act(async () => buySupply.resolve(300))
    expect(getLatestProps(simplePriceChartPureMock).referenceLine).toEqual({ label: 'Limit', price: 600 })
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

function renderChart(mode: 'simple' | 'advanced' = 'simple', label = 'Limit'): void {
  const store = createStore()
  store.set(priceChartModeAtom, mode)

  render(
    <PriceChart
      inputCurrency={null}
      onSelectLimitPrice={jest.fn()}
      outputCurrency={null}
      referenceLine={{ label, price: null }}
    />,
    { wrapper: createWrapper(store) },
  )
}
