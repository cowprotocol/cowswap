import { createStore, Provider } from 'jotai'
import { PropsWithChildren, ReactNode } from 'react'

import { render, screen } from '@testing-library/react'

import { useUsdPrice } from 'modules/usdAmount'

import { PriceChart } from './PriceChart.container'

import { usePriceChartFeatureFlags } from '../../hooks/usePriceChartFeatureFlags'
import { priceChartModeAtom } from '../../state/priceChartModeAtom'

jest.mock('modules/usdAmount', () => ({
  useUsdPrice: jest.fn(),
}))

jest.mock('./PriceChart.pure', () => ({
  PriceChartPure: () => <span>Advanced chart</span>,
}))

jest.mock('./SimplePriceChart.pure', () => ({
  SimplePriceChartPure: () => <span>Simple chart</span>,
}))

jest.mock('../../hooks/usePriceChartFeatureFlags', () => ({
  usePriceChartFeatureFlags: jest.fn(),
}))

const usePriceChartFeatureFlagsMock = usePriceChartFeatureFlags as jest.MockedFunction<typeof usePriceChartFeatureFlags>
const useUsdPriceMock = useUsdPrice as jest.MockedFunction<typeof useUsdPrice>

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

function createWrapper(store: ReturnType<typeof createStore>): (props: PropsWithChildren) => ReactNode {
  return function Wrapper({ children }: PropsWithChildren): ReactNode {
    return <Provider store={store}>{children}</Provider>
  }
}
