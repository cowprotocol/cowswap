import { NATIVE_CURRENCIES, USDC_MAINNET } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { act, render } from '@testing-library/react'

import { loadSavedChartPair, saveChartPair } from '../../lib/chartSelection.utils'
import { SimplePriceChart, type SimplePriceChartProps } from '../../simple/SimplePriceChart'

import { PriceChart } from './index'

jest.mock('../../hooks/usePriceChartFeatureFlags', () => ({
  usePriceChartFeatureFlags: () => ({ isPriceChartEnabled: true }),
}))

jest.mock('../../simple/SimplePriceChart', () => ({ SimplePriceChart: jest.fn(() => null) }))

jest.mock('../../lib/chartSelection.utils', () => ({
  loadSavedChartPair: jest.fn(),
  saveChartPair: jest.fn(),
}))

const nativeCurrency = NATIVE_CURRENCIES[SupportedChainId.MAINNET]
const renderer = jest.mocked(SimplePriceChart)

function latestProps(): SimplePriceChartProps {
  const props = renderer.mock.calls.at(-1)?.[0]
  if (!props) throw new Error('Chart renderer was not called')
  return props
}

describe('PriceChart asset selection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(loadSavedChartPair).mockReturnValue(undefined)
  })

  it('keeps the buy/USD selection after the form currencies change', () => {
    jest.mocked(loadSavedChartPair).mockReturnValue('buy-usd')
    const view = render(<PriceChart inputCurrency={nativeCurrency} outputCurrency={USDC_MAINNET} />)

    expect(latestProps().activeAsset?.symbol).toBe('USDC')

    view.rerender(<PriceChart inputCurrency={USDC_MAINNET} outputCurrency={nativeCurrency} />)

    expect(latestProps().activeAsset?.symbol).toBe('ETH')
  })

  it('maps a selected asset to its USD pair and persists that pair', () => {
    const view = render(<PriceChart inputCurrency={nativeCurrency} outputCurrency={USDC_MAINNET} />)
    expect(latestProps().activeAsset?.symbol).toBe('ETH')

    act(() => latestProps().onSelectAsset(latestProps().assets[1]))

    expect(latestProps().activeAsset?.symbol).toBe('USDC')
    expect(saveChartPair).toHaveBeenCalledWith('buy-usd')

    view.rerender(<PriceChart inputCurrency={USDC_MAINNET} outputCurrency={nativeCurrency} />)

    expect(latestProps().activeAsset?.symbol).toBe('ETH')
  })
})
