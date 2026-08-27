import { USDC_MAINNET, WRAPPED_NATIVE_CURRENCIES as WETH } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { renderHook } from '@testing-library/react'
import { useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useSetupTradeAmountsFromUrl } from './useSetupTradeAmountsFromUrl'
import { useTradeState } from './useTradeState'

jest.mock('react-router', () => ({
  useLocation: jest.fn(),
}))

jest.mock('common/hooks/useNavigate', () => ({
  useNavigate: jest.fn(),
}))

jest.mock('./useDerivedTradeState', () => ({
  useDerivedTradeState: jest.fn(),
}))

jest.mock('./useTradeState', () => ({
  useTradeState: jest.fn(),
}))

const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>
const mockUseDerivedTradeState = useDerivedTradeState as jest.MockedFunction<typeof useDerivedTradeState>
const mockUseTradeState = useTradeState as jest.MockedFunction<typeof useTradeState>

const CHAIN_ID = SupportedChainId.MAINNET
const SELL_TOKEN = USDC_MAINNET
const BUY_TOKEN = WETH[CHAIN_ID]

function mockDerivedState(overrides: {
  inputCurrency?: unknown
  outputCurrency?: unknown
  inputCurrencyAmount?: unknown
  outputCurrencyAmount?: unknown
}): void {
  mockUseDerivedTradeState.mockReturnValueOnce({
    inputCurrency: undefined,
    outputCurrency: undefined,
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    ...overrides,
  } as unknown as ReturnType<typeof useDerivedTradeState>)
}

describe('useSetupTradeAmountsFromUrl', () => {
  const updateState = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseLocation.mockReturnValue({ search: '' } as ReturnType<typeof useLocation>)
    mockUseNavigate.mockReturnValue(jest.fn())
    mockUseTradeState.mockReturnValue({ updateState } as ReturnType<typeof useTradeState>)
  })

  it('defaults the sell amount to 1 unit on first load with nothing typed', () => {
    mockDerivedState({ inputCurrency: SELL_TOKEN })

    renderHook(() => useSetupTradeAmountsFromUrl({}))

    expect(updateState).toHaveBeenCalledTimes(1)
    expect(updateState.mock.calls[0][0].inputCurrencyAmount).toBeTruthy()
  })

  // Regression test for CS-59's flaky `enterSellAmount('1000')` not sticking: typing a real amount
  // before `selectTokens` picks the pair should permanently disable the "1 unit" default, even
  // though switching currencies transiently reads the parsed amount back as null for one render
  // (before it's reparsed against the newly-selected pair).
  it('does not stomp a real typed amount with the "1 unit" default across a currency switch', () => {
    mockDerivedState({
      inputCurrency: SELL_TOKEN,
      inputCurrencyAmount: CurrencyAmount.fromRawAmount(SELL_TOKEN, 1000n * 10n ** 18n),
    })

    const { rerender } = renderHook(() => useSetupTradeAmountsFromUrl({}))

    // A real amount is already present — no default should be applied.
    expect(updateState).not.toHaveBeenCalled()

    // Simulate `selectTokens` switching the output currency: the amount transiently reads back as
    // null for this render.
    mockDerivedState({ inputCurrency: SELL_TOKEN, outputCurrency: BUY_TOKEN })
    rerender()

    expect(updateState).not.toHaveBeenCalled()
  })

  it('still applies the default once a currency becomes available, if no amount was ever set', () => {
    mockDerivedState({})

    const { rerender } = renderHook(() => useSetupTradeAmountsFromUrl({}))

    expect(updateState).not.toHaveBeenCalled()

    mockDerivedState({ inputCurrency: SELL_TOKEN })
    rerender()

    expect(updateState).toHaveBeenCalledTimes(1)
    expect(updateState.mock.calls[0][0].inputCurrencyAmount).toBeTruthy()
  })
})
