import { createStore } from 'jotai/vanilla'
import { ReactNode } from 'react'

import { COW as COWS, USDC_MAINNET } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

import { act, render, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { JotaiTestProvider } from 'test-utils'

import { UsdPricesUpdater } from './UsdPricesUpdater'

import * as coingeckoApi from '../apis/getCoingeckoUsdPrice'
import * as cowProtocolApi from '../apis/getCowProtocolUsdPrice'
import * as defillamaApi from '../apis/getDefillamaUsdPrice'
import * as services from '../services/fetchCurrencyUsdPrice'
import { currenciesUsdPriceQueueAtom, UsdRawPrices, usdRawPricesAtom } from '../state/usdRawPricesAtom'

const mockGetCoingeckoUsdPrice = jest.spyOn(coingeckoApi, 'getCoingeckoUsdPrice')
const mockGetDefillamaUsdPrice = jest.spyOn(defillamaApi, 'getDefillamaUsdPrice')
const mockGetCowProtocolUsdPrice = jest.spyOn(cowProtocolApi, 'getCowProtocolUsdPrice')
const mockFetchCurrencyUsdPrice = jest.spyOn(services, 'fetchCurrencyUsdPrice')

const USDC = USDC_MAINNET
const COW = COWS[SupportedChainId.MAINNET]

const usdcAddress = USDC.address.toLowerCase()
const cowAddress = COW.address.toLowerCase()

const defaultQueue = {
  [usdcAddress]: USDC,
  [cowAddress]: COW,
}

function getWrapper() {
  const store = createStore()
  const initialValues = [[currenciesUsdPriceQueueAtom, { ...defaultQueue }]]

  return {
    store,
    TestComponent: function ({ children }: { children: ReactNode }) {
      return (
        // https://swr.vercel.app/docs/advanced/cache#reset-cache-between-test-cases
        <SWRConfig value={{ provider: () => new Map() }}>
          <JotaiTestProvider store={store} initialValues={initialValues}>
            {children}
          </JotaiTestProvider>
        </SWRConfig>
      )
    },
  }
}

async function performTest(
  priceMock: ((currency: Token) => Promise<number>) | null = null,
  waitForResolvesCount = 0
): Promise<UsdRawPrices> {
  let resolvesCount = 0

  const { TestComponent, store } = getWrapper()

  if (priceMock) {
    mockFetchCurrencyUsdPrice.mockImplementation((currency: Token) => {
      return priceMock(currency).finally(() => {
        resolvesCount++
      })
    })
  }

  act(() => {
    render(<UsdPricesUpdater />, { wrapper: TestComponent })
  })

  await waitFor(() => resolvesCount === waitForResolvesCount)

  return store.get(usdRawPricesAtom)
}

describe('UsdPricesUpdater', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Should mark prices with isLoading=true before fetching', async () => {
    const state = await performTest(() => {
      // Never resolve price
      return new Promise(() => void 0)
    }, 0)

    expect(state[usdcAddress].isLoading).toBe(true)
    expect(state[cowAddress].isLoading).toBe(true)
  })

  it('Should reset isLoading and value fields on fetching error', async () => {
    const state = await performTest(() => {
      // Always throw error on fetching try
      return new Promise((resolve, reject) => {
        reject(new Error('Server error'))
      })
    }, 2)

    expect(state[usdcAddress]).toEqual({ isLoading: false, price: null, currency: USDC })
    expect(state[cowAddress]).toEqual({ isLoading: false, price: null, currency: COW })
  })

  it('Should set price value and isLoading=false on fetching success', async () => {
    const usdcPrice = 1.0
    const cowPrice = 0.5

    const state = await performTest((currency: Token) => {
      // Always return prices
      return new Promise((resolve) => {
        if (currency === USDC) {
          resolve(usdcPrice)
        } else if (currency === COW) {
          resolve(cowPrice)
        }
      })
    }, 2)

    expect(state[usdcAddress]).toEqual({
      isLoading: false,
      price: usdcPrice,
      currency: USDC,
      updatedAt: expect.any(Number),
    })
    expect(state[cowAddress]).toEqual({
      isLoading: false,
      price: cowPrice,
      currency: COW,
      updatedAt: expect.any(Number),
    })
  })

  it('Should use Coingecko API by default', async () => {
    const price = 3.5

    mockGetCoingeckoUsdPrice.mockImplementation(() => Promise.resolve(price))

    const state = await performTest()

    expect(state[usdcAddress].price).toBe(price)
    expect(state[cowAddress].price).toBe(price)

    expect(mockGetCoingeckoUsdPrice).toHaveBeenCalledTimes(2)
    expect(mockGetCowProtocolUsdPrice).toHaveBeenCalledTimes(0)
    expect(mockGetDefillamaUsdPrice).toHaveBeenCalledTimes(0)
  })

  it('Should fallback to Defillama API when Coingecko is down', async () => {
    const price = 7.22

    mockGetDefillamaUsdPrice.mockImplementation(() => Promise.resolve(price))
    mockGetCoingeckoUsdPrice.mockImplementation(() => Promise.reject(new Error('Server error')))

    const state = await performTest()

    expect(state[usdcAddress].price).toBe(price)
    expect(state[cowAddress].price).toBe(price)

    expect(mockGetDefillamaUsdPrice).toHaveBeenCalledTimes(2)
    expect(mockGetCowProtocolUsdPrice).toHaveBeenCalledTimes(0)
  })

  it('Should fallback to CoW Protocol API when Coingecko and Defillama are down', async () => {
    const price = 7.22

    mockGetCowProtocolUsdPrice.mockImplementation(() => Promise.resolve(price))
    mockGetDefillamaUsdPrice.mockImplementation(() => Promise.reject(new Error('Server error')))
    mockGetCoingeckoUsdPrice.mockImplementation(() => Promise.reject(new Error('Server error')))

    const state = await performTest()

    expect(state[usdcAddress].price).toBe(price)
    expect(state[cowAddress].price).toBe(price)

    expect(mockGetCowProtocolUsdPrice).toHaveBeenCalledTimes(2)
  })
})
