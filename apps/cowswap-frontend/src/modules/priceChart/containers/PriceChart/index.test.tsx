import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'

import { NATIVE_CURRENCIES, USDC_MAINNET, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { act, render } from '@testing-library/react'

import { SimplePriceChart, type SimplePriceChartProps } from '../../simple/SimplePriceChart'
import { priceChartPairAtom } from '../../state/priceChartPairAtom'

import { PriceChart } from './index'

jest.mock('../../hooks/usePriceChartFeatureFlags', () => ({
  usePriceChartFeatureFlags: () => ({ isPriceChartEnabled: true }),
}))

jest.mock('../../simple/SimplePriceChart', () => ({ SimplePriceChart: jest.fn(() => null) }))

const nativeCurrency = NATIVE_CURRENCIES[SupportedChainId.MAINNET]
const renderer = jest.mocked(SimplePriceChart)

function latestProps(): SimplePriceChartProps {
  const props = renderer.mock.calls.at(-1)?.[0]
  if (!props) throw new Error('Chart renderer was not called')
  return props
}

describe('PriceChart pair selection', () => {
  let store: ReturnType<typeof createStore>

  function wrapper({ children }: { children: ReactNode }): ReactNode {
    return <Provider store={store}>{children}</Provider>
  }

  beforeEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
    store = createStore()
    store.set(priceChartPairAtom, 'sell-usd')
  })

  it('keeps the buy/USD selection after the form currencies change', () => {
    store.set(priceChartPairAtom, 'buy-usd')
    const view = render(<PriceChart inputCurrency={nativeCurrency} outputCurrency={USDC_MAINNET} />, { wrapper })

    expect(latestProps().activeCurrency?.symbol).toBe('USDC')

    view.rerender(<PriceChart inputCurrency={USDC_MAINNET} outputCurrency={nativeCurrency} />)

    expect(latestProps().activeCurrency?.symbol).toBe('ETH')
  })

  it('maps a selected asset to its USD pair and persists that pair', () => {
    const view = render(<PriceChart inputCurrency={nativeCurrency} outputCurrency={USDC_MAINNET} />, { wrapper })
    expect(latestProps().activeCurrency?.symbol).toBe('ETH')

    act(() => latestProps().onSelectCurrency(latestProps().currencies[1]))

    expect(latestProps().activeCurrency?.symbol).toBe('USDC')
    expect(store.get(priceChartPairAtom)).toBe('buy-usd')
    expect(window.localStorage.getItem('priceChartSelection:v0')).toBe(JSON.stringify('buy-usd'))

    view.rerender(<PriceChart inputCurrency={USDC_MAINNET} outputCurrency={nativeCurrency} />)

    expect(latestProps().activeCurrency?.symbol).toBe('ETH')
  })

  it('keeps native and wrapped currencies as distinct chart choices', () => {
    const wrappedCurrency = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.MAINNET]
    render(<PriceChart inputCurrency={nativeCurrency} outputCurrency={wrappedCurrency} />, { wrapper })
    expect(latestProps().currencies).toEqual([nativeCurrency, wrappedCurrency])

    act(() => latestProps().onSelectCurrency(wrappedCurrency))

    expect(latestProps().activeCurrency).toBe(wrappedCurrency)
    expect(store.get(priceChartPairAtom)).toBe('buy-usd')
  })

  it('distinguishes currencies that share a display symbol', () => {
    const otherCurrency = new Token(SupportedChainId.MAINNET, '0x0000000000000000000000000000000000000001', 6, 'USDC')
    render(<PriceChart inputCurrency={USDC_MAINNET} outputCurrency={otherCurrency} />, { wrapper })

    act(() => latestProps().onSelectCurrency(otherCurrency))

    expect(latestProps().activeCurrency).toBe(otherCurrency)
    expect(store.get(priceChartPairAtom)).toBe('buy-usd')
  })

  it('keeps the selected pair across chart remounts', () => {
    const view = render(<PriceChart inputCurrency={nativeCurrency} outputCurrency={USDC_MAINNET} />, { wrapper })
    act(() => latestProps().onSelectCurrency(USDC_MAINNET))
    view.unmount()

    render(<PriceChart inputCurrency={nativeCurrency} outputCurrency={USDC_MAINNET} />, { wrapper })

    expect(latestProps().activeCurrency).toBe(USDC_MAINNET)
  })

  it('waits for both currencies before exposing chart choices', () => {
    render(<PriceChart inputCurrency={nativeCurrency} outputCurrency={null} />, { wrapper })

    expect(latestProps().currencies).toEqual([])
    expect(latestProps().activeCurrency).toBeUndefined()
  })
})
