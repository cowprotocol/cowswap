import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { act, renderHook } from '@testing-library/react'

import { useDerivedTradeState } from 'modules/trade'
import { isQuoteForCurrencies, useTradeQuote } from 'modules/tradeQuote'
import { useTradeUsdAmounts } from 'modules/usdAmount'

import { useFiatValuePriceImpact } from './useFiatValuePriceImpact'

jest.mock('@cowprotocol/common-hooks', () => ({
  ...jest.requireActual('@cowprotocol/common-hooks'),
  useDebounce: jest.fn((value) => value),
}))

jest.mock('modules/trade', () => ({
  useDerivedTradeState: jest.fn(),
}))

jest.mock('modules/tradeQuote', () => ({
  useTradeQuote: jest.fn(),
  isQuoteForCurrencies: jest.fn(),
}))

jest.mock('modules/usdAmount', () => ({
  useTradeUsdAmounts: jest.fn(),
}))

jest.mock('./logger', () => ({
  logPriceImpact: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

const mockedUseDerivedTradeState = useDerivedTradeState as jest.MockedFunction<typeof useDerivedTradeState>
const mockedUseTradeUsdAmounts = useTradeUsdAmounts as jest.MockedFunction<typeof useTradeUsdAmounts>
const mockedUseTradeQuote = useTradeQuote as jest.MockedFunction<typeof useTradeQuote>
const mockedIsQuoteForCurrencies = isQuoteForCurrencies as jest.MockedFunction<typeof isQuoteForCurrencies>

function createToken(symbol: string, address: string): Token {
  return new Token(ChainId.SEPOLIA, address, 18, symbol, symbol)
}

// `fetchStartTimestamp` bumps on every genuine quote request and is what the hook keys its
// safety-valve timeout reset off of, so tests set it explicitly per quote.
function tradeQuoteState(params: {
  isLoading: boolean
  hasParamsChanged: boolean
  fetchStartTimestamp: number
}): ReturnType<typeof useTradeQuote> {
  return {
    isLoading: params.isLoading,
    hasParamsChanged: params.hasParamsChanged,
    fetchParams: { fetchStartTimestamp: params.fetchStartTimestamp },
  } as unknown as ReturnType<typeof useTradeQuote>
}

describe('useFiatValuePriceImpact', () => {
  const inputToken = createToken('ETH', '0x0000000000000000000000000000000000000001')
  const outputToken = createToken('COW', '0x0000000000000000000000000000000000000002')
  const updatedOutputToken = createToken('USDC', '0x0000000000000000000000000000000000000003')

  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()

    mockedUseDerivedTradeState.mockReturnValue({
      inputCurrency: inputToken,
      outputCurrency: outputToken,
      inputCurrencyAmount: CurrencyAmount.fromRawAmount(inputToken, 1),
      outputCurrencyAmount: CurrencyAmount.fromRawAmount(outputToken, 1),
    } as ReturnType<typeof useDerivedTradeState>)

    mockedUseTradeQuote.mockReturnValue(
      tradeQuoteState({ isLoading: false, hasParamsChanged: false, fetchStartTimestamp: 1 }),
    )
    mockedIsQuoteForCurrencies.mockReturnValue(true)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('stops loading after 15 seconds when USD amounts never resolve', () => {
    mockedUseTradeUsdAmounts.mockReturnValue({
      inputAmount: { value: null, isLoading: true },
      outputAmount: { value: null, isLoading: true },
    })

    const { result } = renderHook(() => useFiatValuePriceImpact())

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: true })

    act(() => {
      jest.advanceTimersByTime(15_000)
    })

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: false })
  })

  it('does not restart the loading timeout when price loading flickers', () => {
    mockedUseTradeUsdAmounts.mockReturnValue({
      inputAmount: { value: null, isLoading: true },
      outputAmount: { value: null, isLoading: true },
    })

    const { result, rerender } = renderHook(() => useFiatValuePriceImpact())

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: true })

    act(() => {
      jest.advanceTimersByTime(7_500)
    })

    mockedUseTradeUsdAmounts.mockReturnValue({
      inputAmount: { value: null, isLoading: false },
      outputAmount: { value: null, isLoading: false },
    })
    rerender()

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: false })

    mockedUseTradeUsdAmounts.mockReturnValue({
      inputAmount: { value: null, isLoading: true },
      outputAmount: { value: null, isLoading: true },
    })
    rerender()

    act(() => {
      jest.advanceTimersByTime(7_500)
    })

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: false })

    mockedUseTradeUsdAmounts.mockReturnValue({
      inputAmount: { value: null, isLoading: false },
      outputAmount: { value: null, isLoading: false },
    })
    rerender()

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: false })

    mockedUseTradeUsdAmounts.mockReturnValue({
      inputAmount: { value: null, isLoading: true },
      outputAmount: { value: null, isLoading: true },
    })
    rerender()

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: false })
  })

  it('restarts the loading timeout when the output token changes after timing out', () => {
    mockedUseTradeUsdAmounts.mockReturnValue({
      inputAmount: { value: null, isLoading: true },
      outputAmount: { value: null, isLoading: true },
    })

    const { result, rerender } = renderHook(() => useFiatValuePriceImpact())

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: true })

    act(() => {
      jest.advanceTimersByTime(15_000)
    })

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: false })

    mockedUseDerivedTradeState.mockReturnValue({
      inputCurrency: inputToken,
      outputCurrency: updatedOutputToken,
      inputCurrencyAmount: CurrencyAmount.fromRawAmount(inputToken, 1),
      outputCurrencyAmount: CurrencyAmount.fromRawAmount(updatedOutputToken, 1),
    } as ReturnType<typeof useDerivedTradeState>)
    rerender()

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: true })

    act(() => {
      jest.advanceTimersByTime(15_000)
    })

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: false })
  })

  it('keeps a timed-out unknown impact while a same-pair quote loads', () => {
    mockedUseTradeUsdAmounts.mockReturnValue({
      inputAmount: { value: null, isLoading: true },
      outputAmount: { value: null, isLoading: true },
    })

    const { result, rerender } = renderHook(() => useFiatValuePriceImpact())

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: true })

    act(() => {
      jest.advanceTimersByTime(15_000)
    })

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: false })

    mockedUseTradeQuote.mockReturnValue(
      tradeQuoteState({ isLoading: true, hasParamsChanged: true, fetchStartTimestamp: 2 }),
    )
    rerender()

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: false })
  })

  it('keeps an unknown impact while a same-pair quote loads', () => {
    mockedUseTradeUsdAmounts.mockReturnValue({
      inputAmount: { value: null, isLoading: false },
      outputAmount: { value: null, isLoading: false },
    })

    const { result, rerender } = renderHook(() => useFiatValuePriceImpact())

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: false })

    mockedUseTradeQuote.mockReturnValue(
      tradeQuoteState({ isLoading: true, hasParamsChanged: true, fetchStartTimestamp: 2 }),
    )
    rerender()

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: false })
  })

  describe('when the quote refreshes after a settled price impact', () => {
    const usdToken = new Token(ChainId.SEPOLIA, '0x0000000000000000000000000000000000000004', 0, 'USD', 'USD')

    function settle(): ReturnType<typeof renderHook<ReturnType<typeof useFiatValuePriceImpact>, unknown>> {
      mockedUseTradeUsdAmounts.mockReturnValue({
        inputAmount: { value: CurrencyAmount.fromRawAmount(usdToken, 100), isLoading: false },
        outputAmount: { value: CurrencyAmount.fromRawAmount(usdToken, 90), isLoading: false },
      } as ReturnType<typeof useTradeUsdAmounts>)

      const hook = renderHook(() => useFiatValuePriceImpact())

      expect(hook.result.current?.isLoading).toBe(false)
      expect(hook.result.current?.priceImpact?.toFixed(0)).toBe('10')

      return hook
    }

    it('keeps the settled value for the same pair while the new quote loads', () => {
      const { result, rerender } = settle()

      mockedUseTradeUsdAmounts.mockReturnValue({
        inputAmount: { value: CurrencyAmount.fromRawAmount(usdToken, 200), isLoading: false },
        outputAmount: { value: CurrencyAmount.fromRawAmount(usdToken, 90), isLoading: false },
      } as ReturnType<typeof useTradeUsdAmounts>)
      mockedUseTradeQuote.mockReturnValue(
        tradeQuoteState({ isLoading: true, hasParamsChanged: true, fetchStartTimestamp: 2 }),
      )
      rerender()

      expect(result.current?.isLoading).toBe(false)
      expect(result.current?.priceImpact?.toFixed(0)).toBe('10')
    })

    it('does not reuse the settled value after switching away from the pair and back', () => {
      const { result, rerender } = settle()

      mockedUseTradeQuote.mockReturnValue(
        tradeQuoteState({ isLoading: true, hasParamsChanged: true, fetchStartTimestamp: 2 }),
      )
      mockedUseDerivedTradeState.mockReturnValue({
        inputCurrency: inputToken,
        outputCurrency: updatedOutputToken,
        inputCurrencyAmount: CurrencyAmount.fromRawAmount(inputToken, 1),
        outputCurrencyAmount: CurrencyAmount.fromRawAmount(updatedOutputToken, 1),
      } as ReturnType<typeof useDerivedTradeState>)
      rerender()

      mockedUseDerivedTradeState.mockReturnValue({
        inputCurrency: inputToken,
        outputCurrency: outputToken,
        inputCurrencyAmount: CurrencyAmount.fromRawAmount(inputToken, 1),
        outputCurrencyAmount: CurrencyAmount.fromRawAmount(outputToken, 1),
      } as ReturnType<typeof useDerivedTradeState>)
      rerender()

      expect(result.current).toEqual({ priceImpact: undefined, isLoading: true })
    })

    it('reports loading after a token switch until a quote for the new pair exists', () => {
      const { result, rerender } = settle()

      mockedUseDerivedTradeState.mockReturnValue({
        inputCurrency: updatedOutputToken,
        outputCurrency: outputToken,
        inputCurrencyAmount: CurrencyAmount.fromRawAmount(updatedOutputToken, 1),
        outputCurrencyAmount: CurrencyAmount.fromRawAmount(outputToken, 1),
      } as ReturnType<typeof useDerivedTradeState>)
      mockedIsQuoteForCurrencies.mockReturnValue(false)
      rerender()

      expect(result.current).toEqual({ priceImpact: undefined, isLoading: true })

      mockedIsQuoteForCurrencies.mockReturnValue(true)
      rerender()

      expect(result.current?.isLoading).toBe(false)
      expect(result.current?.priceImpact?.toFixed(0)).toBe('10')
    })

    it('reports loading when the token pair changes', () => {
      const { result, rerender } = settle()

      mockedUseDerivedTradeState.mockReturnValue({
        inputCurrency: inputToken,
        outputCurrency: updatedOutputToken,
        inputCurrencyAmount: CurrencyAmount.fromRawAmount(inputToken, 1),
        outputCurrencyAmount: CurrencyAmount.fromRawAmount(updatedOutputToken, 1),
      } as ReturnType<typeof useDerivedTradeState>)
      mockedUseTradeQuote.mockReturnValue(
        tradeQuoteState({ isLoading: true, hasParamsChanged: true, fetchStartTimestamp: 2 }),
      )
      rerender()

      expect(result.current).toEqual({ priceImpact: undefined, isLoading: true })
    })
  })
})
