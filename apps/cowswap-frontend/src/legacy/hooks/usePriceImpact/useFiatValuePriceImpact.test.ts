import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { act, renderHook } from '@testing-library/react'

import { useDerivedTradeState } from 'modules/trade'
import { useTradeUsdAmounts } from 'modules/usdAmount'

import { useFiatValuePriceImpact } from './useFiatValuePriceImpact'

jest.mock('@cowprotocol/common-hooks', () => ({
  ...jest.requireActual('@cowprotocol/common-hooks'),
  useDebounce: jest.fn((value) => value),
}))

jest.mock('modules/trade', () => ({
  useDerivedTradeState: jest.fn(),
}))

jest.mock('modules/usdAmount', () => ({
  useTradeUsdAmounts: jest.fn(),
}))

const mockedUseDerivedTradeState = useDerivedTradeState as jest.MockedFunction<typeof useDerivedTradeState>
const mockedUseTradeUsdAmounts = useTradeUsdAmounts as jest.MockedFunction<typeof useTradeUsdAmounts>

function createToken(symbol: string, address: string): Token {
  return new Token(ChainId.SEPOLIA, address, 18, symbol, symbol)
}

describe('useFiatValuePriceImpact', () => {
  const inputToken = createToken('ETH', '0x0000000000000000000000000000000000000001')
  const outputToken = createToken('COW', '0x0000000000000000000000000000000000000002')

  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()

    mockedUseDerivedTradeState.mockReturnValue({
      inputCurrency: inputToken,
      outputCurrency: outputToken,
      inputCurrencyAmount: CurrencyAmount.fromRawAmount(inputToken, 1),
      outputCurrencyAmount: CurrencyAmount.fromRawAmount(outputToken, 1),
    } as ReturnType<typeof useDerivedTradeState>)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('stops loading after 2 minutes when USD amounts never resolve', () => {
    mockedUseTradeUsdAmounts.mockReturnValue({
      inputAmount: { value: null, isLoading: true },
      outputAmount: { value: null, isLoading: true },
    })

    const { result } = renderHook(() => useFiatValuePriceImpact())

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: true })

    act(() => {
      jest.advanceTimersByTime(120_000)
    })

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: false })
  })
})
