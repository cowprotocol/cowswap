import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { act, renderHook } from '@testing-library/react'

import { useDerivedTradeState } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
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

  it('restarts the loading timeout when a new quote begins after timing out', () => {
    mockedUseTradeUsdAmounts.mockReturnValue({
      inputAmount: { value: null, isLoading: true },
      outputAmount: { value: null, isLoading: true },
    })

    const { result, rerender } = renderHook(() => useFiatValuePriceImpact())

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: true })

    act(() => {
      jest.advanceTimersByTime(15_000)
    })

    // Stale value stays suppressed only until the safety-valve timeout fires
    expect(result.current).toEqual({ priceImpact: undefined, isLoading: false })

    // A fresh quote for the same token pair must re-arm the timeout and suppress the stale value again
    mockedUseTradeQuote.mockReturnValue(
      tradeQuoteState({ isLoading: true, hasParamsChanged: true, fetchStartTimestamp: 2 }),
    )
    rerender()

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: true })

    act(() => {
      jest.advanceTimersByTime(15_000)
    })

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: false })
  })

  it('re-arms the timeout when a second same-pair quote starts while params are already changed', () => {
    mockedUseTradeUsdAmounts.mockReturnValue({
      inputAmount: { value: null, isLoading: false },
      outputAmount: { value: null, isLoading: false },
    })

    // First changed-params quote for the pair is in flight
    mockedUseTradeQuote.mockReturnValue(
      tradeQuoteState({ isLoading: true, hasParamsChanged: true, fetchStartTimestamp: 1 }),
    )

    const { result, rerender } = renderHook(() => useFiatValuePriceImpact())

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: true })

    act(() => {
      jest.advanceTimersByTime(15_000)
    })

    // Safety valve fired
    expect(result.current).toEqual({ priceImpact: undefined, isLoading: false })

    // A SECOND changed-params quote for the same pair starts: `hasParamsChanged` stays true
    // (true -> true), only the per-fetch timestamp advances. This must still re-arm the timeout
    // and keep the stale value suppressed, which keying off the boolean alone failed to do.
    mockedUseTradeQuote.mockReturnValue(
      tradeQuoteState({ isLoading: true, hasParamsChanged: true, fetchStartTimestamp: 2 }),
    )
    rerender()

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: true })

    act(() => {
      jest.advanceTimersByTime(15_000)
    })

    expect(result.current).toEqual({ priceImpact: undefined, isLoading: false })
  })
})
