import { createStore } from 'jotai/vanilla'
import { ReactNode } from 'react'

import { COW_TOKEN_TO_CHAIN, USDC_MAINNET } from '@cowprotocol/common-const'
import { FractionUtils } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Fraction, Token } from '@uniswap/sdk-core'

import { act, render, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { JotaiTestProvider } from 'test-utils'

import { UsdPricesUpdater } from './UsdPricesUpdater'

import * as bffUsdApi from '../apis/getBffUsdPrice'
import * as cowProtocolApi from '../apis/getCowProtocolUsdPrice'
import * as defillamaApi from '../apis/getDefillamaUsdPrice'
import * as services from '../services/fetchCurrencyUsdPrice'
import { currenciesUsdPriceQueueAtom, UsdRawPrices, usdRawPricesAtom } from '../state/usdRawPricesAtom'
import { getUsdPriceStateKey } from '../utils/usdPriceStateKey'

jest.mock('common/hooks/useIsProviderNetworkUnsupported', () => {
  return {
    ...jest.requireActual('common/hooks/useIsProviderNetworkUnsupported'),
    useIsProviderNetworkUnsupported: jest.fn().mockReturnValue(false),
  }
})

const mockGetBffUsdPrice = jest.spyOn(bffUsdApi, 'getBffUsdPrice')
const mockGetDefillamaUsdPrice = jest.spyOn(defillamaApi, 'getDefillamaUsdPrice')
const mockGetCowProtocolUsdPrice = jest.spyOn(cowProtocolApi, 'getCowProtocolUsdPrice')
const mockFetchCurrencyUsdPrice = jest.spyOn(services, 'fetchCurrencyUsdPrice')

const USDC = USDC_MAINNET
const CowToken = COW_TOKEN_TO_CHAIN[SupportedChainId.MAINNET]

if (!CowToken) {
  throw new Error(`COW token not found for chain ${SupportedChainId.MAINNET}`)
}

const usdcKey = getUsdPriceStateKey(USDC)
const cowKey = getUsdPriceStateKey(CowToken)

const defaultQueue = {
  [usdcKey]: USDC,
  [cowKey]: CowToken,
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
  priceMock: ((currency: Token) => Promise<Fraction | null>) | null = null,
  waitForResolvesCount = 0,
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

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
describe('UsdPricesUpdater', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Should mark prices with isLoading=true before fetching', async () => {
    const state = await performTest(() => {
      // Never resolve price
      return new Promise(() => void 0)
    }, 0)

    expect(state[usdcKey].isLoading).toBe(true)
    expect(state[cowKey].isLoading).toBe(true)
  })

  it('Should reset isLoading and value fields on fetching error', async () => {
    const state = await performTest(() => {
      // Always throw error on fetching try
      return new Promise((resolve, reject) => {
        reject(new Error('Server error'))
      })
    }, 2)

    expect(state[usdcKey]).toEqual({ isLoading: false, price: null, currency: USDC })
    expect(state[cowKey]).toEqual({ isLoading: false, price: null, currency: CowToken })
  })

  it('Should set price value and isLoading=false on fetching success', async () => {
    const usdcPrice = FractionUtils.fromNumber(1.0)
    const cowPrice = FractionUtils.fromNumber(0.5)

    const state = await performTest((currency: Token) => {
      // Always return prices
      return new Promise((resolve) => {
        if (currency === USDC) {
          resolve(usdcPrice)
        } else if (currency === CowToken) {
          resolve(cowPrice)
        }
      })
    }, 2)

    expect(state[usdcKey]).toEqual({
      isLoading: false,
      price: usdcPrice,
      currency: USDC,
      updatedAt: expect.any(Number),
    })
    expect(state[cowKey]).toEqual({
      isLoading: false,
      price: cowPrice,
      currency: CowToken,
      updatedAt: expect.any(Number),
    })
  })

  it('Should use BFF API by default', async () => {
    const price = FractionUtils.fromNumber(3.5)

    mockFetchCurrencyUsdPrice.mockRestore()
    mockGetBffUsdPrice.mockImplementation(() => Promise.resolve(price))

    const state = await performTest()

    expect(state[usdcKey].price).toBe(price)
    expect(state[cowKey].price).toBe(price)

    expect(mockGetBffUsdPrice).toHaveBeenCalledTimes(2)
    expect(mockGetCowProtocolUsdPrice).toHaveBeenCalledTimes(0)
    expect(mockGetDefillamaUsdPrice).toHaveBeenCalledTimes(0)
  })

  it('Should fallback to Defillama API when BFF is down', async () => {
    const price = FractionUtils.fromNumber(7.22)

    mockFetchCurrencyUsdPrice.mockRestore()
    mockGetBffUsdPrice.mockImplementation(() => Promise.reject(new Error('Server error')))
    mockGetDefillamaUsdPrice.mockImplementation(() => Promise.resolve(price))

    const state = await performTest()

    expect(state[usdcKey].price).toBe(price)
    expect(state[cowKey].price).toBe(price)

    expect(mockGetDefillamaUsdPrice).toHaveBeenCalledTimes(2)
    expect(mockGetCowProtocolUsdPrice).toHaveBeenCalledTimes(0)
  })

  it('Should fallback to CoW Protocol API when Coingecko and Defillama are down', async () => {
    const price = FractionUtils.fromNumber(7.22)

    mockFetchCurrencyUsdPrice.mockRestore()
    mockGetBffUsdPrice.mockImplementation(() => Promise.reject(new Error('Server error')))
    mockGetDefillamaUsdPrice.mockImplementation(() => Promise.reject(new Error('Server error')))
    mockGetCowProtocolUsdPrice.mockImplementation(() => Promise.resolve(price))

    const state = await performTest()

    expect(state[usdcKey].price).toBe(price)
    expect(state[cowKey].price).toBe(price)

    expect(mockGetCowProtocolUsdPrice).toHaveBeenCalledTimes(2)
  })
})
