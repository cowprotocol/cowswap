/** @jest-environment jsdom */

import type { JSX, ReactNode } from 'react'

import { render } from '@testing-library/react'

import { ChartSection } from '.'

const mockUseQuery = jest.fn()

jest.mock('@apollo/client', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}))

jest.mock('@visx/responsive', () => ({
  ParentSize: ({ children }: { children: ({ width }: { width: number }) => JSX.Element }) => children({ width: 320 }),
}))

jest.mock('services/uniswap-price/queries', () => ({
  tokenPriceQuery: 'token-price-query',
  HistoryDuration: {
    Day: 'day',
  },
  Chain: {
    Ethereum: 'ethereum',
  },
}))

jest.mock('util/fixChart', () => ({
  fixChart: jest.fn(() => ({ prices: [], blanks: [] })),
}))

jest.mock('lib/hooks/usePriceHistory', () => ({
  usePriceHistory: jest.fn(() => null),
}))

jest.mock('../Chart/LoadingChart', () => ({
  ChartContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  LoadingChart: () => <div>Loading chart</div>,
}))

jest.mock('../Chart', () => ({
  Chart: () => <div>Chart</div>,
  TimePeriod: {
    DAY: 'DAY',
  },
}))

describe('ChartSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseQuery.mockReturnValue({ data: undefined, loading: false })
  })

  it('skips the Ethereum price query when the ethereum platform is missing', () => {
    expect(() =>
      render(
        <ChartSection
          platforms={{
            base: {
              contractAddress: '0x4200000000000000000000000000000000000006',
              decimalPlace: 18,
            },
          }}
        />,
      ),
    ).not.toThrow()

    expect(mockUseQuery).toHaveBeenCalledWith('token-price-query', {
      variables: undefined,
      skip: true,
    })
  })
})
