import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Percent, Token } from '@cowprotocol/currency'

import { act, renderHook } from '@testing-library/react'

import { useTradeConfirmActions } from 'modules/trade'
import { useTradeQuoteFeeFiatAmount } from 'modules/tradeQuote'

import { SwapAmountDifference, useSwapAmountDifference } from './useSwapAmountDifference'
import { useSwapPriceDifferenceWarningProps } from './useSwapPriceDifferenceWarningProps'

jest.mock('./useSwapAmountDifference', () => ({
  useSwapAmountDifference: jest.fn(),
}))

jest.mock('modules/tradeQuote', () => ({
  useTradeQuoteFeeFiatAmount: jest.fn(),
}))

const mockedUseSwapAmountDifference = useSwapAmountDifference as jest.MockedFunction<typeof useSwapAmountDifference>
const mockedUseTradeQuoteFeeFiatAmount = useTradeQuoteFeeFiatAmount as jest.MockedFunction<
  typeof useTradeQuoteFeeFiatAmount
>

const WETH = new Token(
  SupportedChainId.MAINNET,
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  18,
  'WETH',
  'Wrapped Ether',
)
const USDC = new Token(SupportedChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin')

function difference(rawAmount: string, percentNumerator: number): SwapAmountDifference {
  return {
    amount: CurrencyAmount.fromRawAmount(WETH, rawAmount),
    percent: new Percent(percentNumerator, 100),
  }
}

const CONFIRMED = difference('1000000000000000000', 2)
const REFRESHED = difference('5000000000000000000', 9)
const CONFIRMED_FEE = CurrencyAmount.fromRawAmount(USDC, '1000000')
const REFRESHED_FEE = CurrencyAmount.fromRawAmount(USDC, '7000000')

function renderWarningProps(): ReturnType<
  typeof renderHook<
    { values: ReturnType<typeof useSwapPriceDifferenceWarningProps>; setConfirming: (v: boolean) => void },
    void
  >
> {
  return renderHook(() => ({
    values: useSwapPriceDifferenceWarningProps(),
    setConfirming: useTradeConfirmActions().setConfirming,
  }))
}

describe('useSwapPriceDifferenceWarningProps', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseSwapAmountDifference.mockReturnValue(CONFIRMED)
    mockedUseTradeQuoteFeeFiatAmount.mockReturnValue(CONFIRMED_FEE)
  })

  it('follows the live quote while the user has not confirmed yet', () => {
    const { result, rerender } = renderWarningProps()

    act(() => result.current.setConfirming(false))

    expect(result.current.values.swapAmountDifference).toBe(CONFIRMED)

    mockedUseSwapAmountDifference.mockReturnValue(REFRESHED)
    mockedUseTradeQuoteFeeFiatAmount.mockReturnValue(REFRESHED_FEE)
    rerender()

    expect(result.current.values.swapAmountDifference).toBe(REFRESHED)
    expect(result.current.values.feeFiatAmount).toBe(REFRESHED_FEE)
  })

  it('holds the confirmed values when a quote refresh lands while confirming', () => {
    const { result, rerender } = renderWarningProps()

    act(() => result.current.setConfirming(false))

    expect(result.current.values.swapAmountDifference).toBe(CONFIRMED)

    // User clicks confirm, then a quote refresh lands while the wallet prompt is open.
    act(() => result.current.setConfirming(true))

    mockedUseSwapAmountDifference.mockReturnValue(REFRESHED)
    mockedUseTradeQuoteFeeFiatAmount.mockReturnValue(REFRESHED_FEE)
    rerender()

    // Both halves of the banner must stay on the confirmed snapshot, never a mix of the two.
    expect(result.current.values.swapAmountDifference).toBe(CONFIRMED)
    expect(result.current.values.feeFiatAmount).toBe(CONFIRMED_FEE)
  })

  it('resumes following the live quote once the confirm attempt is aborted', () => {
    const { result, rerender } = renderWarningProps()

    act(() => result.current.setConfirming(false))
    act(() => result.current.setConfirming(true))

    mockedUseSwapAmountDifference.mockReturnValue(REFRESHED)
    mockedUseTradeQuoteFeeFiatAmount.mockReturnValue(REFRESHED_FEE)
    rerender()

    expect(result.current.values.swapAmountDifference).toBe(CONFIRMED)

    act(() => result.current.setConfirming(false))

    expect(result.current.values.swapAmountDifference).toBe(REFRESHED)
    expect(result.current.values.feeFiatAmount).toBe(REFRESHED_FEE)
  })
})
