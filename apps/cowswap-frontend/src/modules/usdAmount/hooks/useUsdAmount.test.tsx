import { createStore } from 'jotai/vanilla'
import { ReactNode } from 'react'

import { WETH_GNOSIS_CHAIN } from '@cowprotocol/common-const'
import { CurrencyAmount, Fraction } from '@uniswap/sdk-core'

import { renderHook } from '@testing-library/react'
import { JotaiTestProvider } from 'test-utils'

import { useUsdAmount } from './useUsdAmount'

import { usdRawPricesAtom, UsdRawPriceState } from '../state/usdRawPricesAtom'
import { getUsdPriceStateKey } from '../utils/usdPriceStateKey'

const WETH_RAW_PRICE_STATE: UsdRawPriceState = {
  updatedAt: Date.now(),
  price: new Fraction('1650'),
  currency: WETH_GNOSIS_CHAIN,
  isLoading: false,
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getWrapper() {
  const store = createStore()
  const initialValues = [[usdRawPricesAtom, { [getUsdPriceStateKey(WETH_GNOSIS_CHAIN)]: WETH_RAW_PRICE_STATE }]]

  return {
    store,
    TestComponent: function ({ children }: { children: ReactNode }) {
      return (
        <JotaiTestProvider store={store} initialValues={initialValues}>
          {children}
        </JotaiTestProvider>
      )
    },
  }
}

describe('useUsdAmount', () => {
  const ONE_WETH = CurrencyAmount.fromRawAmount(WETH_GNOSIS_CHAIN, 1 * 10 ** WETH_GNOSIS_CHAIN.decimals)

  it('USD amount for 1 WETH should be 1650', async () => {
    const { TestComponent } = getWrapper()
    const { result } = renderHook(
      () => {
        return useUsdAmount(ONE_WETH)
      },
      { wrapper: TestComponent },
    )

    expect(result.current.value?.toExact()).toBe(WETH_RAW_PRICE_STATE?.price?.toFixed(0))
  })
})
