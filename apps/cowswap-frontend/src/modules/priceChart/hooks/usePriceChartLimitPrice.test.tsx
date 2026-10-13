import { useQuery } from '@tanstack/react-query'

import { Price, Token } from '@cowprotocol/currency'

import { renderHook } from '@testing-library/react'

import { usePriceChartLimitPrice } from './usePriceChartLimitPrice'

import type { ChartMetric } from '../lib/priceChart.types'

jest.mock('@tanstack/react-query', () => ({ useQuery: jest.fn() }))
jest.mock('modules/usdAmount', () => ({ useUsdPrice: () => null }))
jest.mock('../lib/priceChartLimitPrice.utils', () => ({
  getActivePriceLimitLinePrice: () => 2,
  getSelectedPriceLimitRate: jest.fn(),
}))

it('scales reference lines by supply without requiring price selection and waits for supply', () => {
  const inputCurrency = new Token(1, '0x0000000000000000000000000000000000000001', 18)
  const outputCurrency = new Token(1, '0x0000000000000000000000000000000000000002', 18)
  const referenceLines = [
    { id: 'limit', label: 'Limit', variant: 'trade' as const, price: new Price(inputCurrency, outputCurrency, 1, 1) },
  ]
  jest.mocked(useQuery).mockReturnValue({ data: 100 } as ReturnType<typeof useQuery>)
  const { result, rerender } = renderHook(
    ({ metric }) =>
      usePriceChartLimitPrice({
        activeCurrency: inputCurrency,
        inputCurrency,
        outputCurrency,
        metric,
        supplyVariant: 'circulating',
        referenceLines,
      }),
    { initialProps: { metric: 'marketCap' as ChartMetric } },
  )
  expect(useQuery).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: true }))
  expect(result.current.referenceLines[0].price).toBe(200)
  rerender({ metric: 'price' })
  expect(result.current.referenceLines[0].price).toBe(2)
  jest.mocked(useQuery).mockReturnValue({ data: undefined } as ReturnType<typeof useQuery>)
  rerender({ metric: 'marketCap' })
  expect(result.current.referenceLines).toEqual([])
})
