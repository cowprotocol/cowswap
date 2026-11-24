import { useAtomValue } from 'jotai'

import { USDC_MAINNET } from '@cowprotocol/common-const'
import { CurrencyAmount } from '@cowprotocol/currency'

import { renderHook } from '@testing-library/react'

import {
  formatPositiveFiat,
  isCanonicalBatchScheduleErrorAtom,
  useDerivedTradeState,
  waitAndSaveComparisonQuoteAtom,
  waitAndSaveEnabledAtom,
  type WaitAndSaveComparisonQuote,
} from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { useUsdAmount } from 'modules/usdAmount'

import { useWaitAndSaveSaveAmount } from './useWaitAndSaveSaveAmount'

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: jest.fn(),
}))

jest.mock('modules/trade', () => {
  const fee = jest.requireActual('modules/trade/utils/waitAndSaveWaivedFee')
  const fiat = jest.requireActual('modules/trade/utils/formatPositiveFiat')

  return {
    formatPositiveFiat: fiat.formatPositiveFiat,
    getWaitAndSaveWaivedFeeRawAmount: fee.getWaitAndSaveWaivedFeeRawAmount,
    isCanonicalBatchScheduleErrorAtom: Symbol('isCanonicalBatchScheduleErrorAtom'),
    useDerivedTradeState: jest.fn(),
    waitAndSaveComparisonQuoteAtom: Symbol('waitAndSaveComparisonQuoteAtom'),
    waitAndSaveEnabledAtom: Symbol('waitAndSaveEnabledAtom'),
  }
})

jest.mock('modules/tradeQuote', () => ({
  useTradeQuote: jest.fn(),
}))

jest.mock('modules/usdAmount', () => ({
  useUsdAmount: jest.fn(),
}))

const useAtomValueMock = useAtomValue as jest.MockedFunction<typeof useAtomValue>
const useDerivedTradeStateMock = useDerivedTradeState as jest.MockedFunction<typeof useDerivedTradeState>
const useTradeQuoteMock = useTradeQuote as jest.MockedFunction<typeof useTradeQuote>
const useUsdAmountMock = useUsdAmount as jest.MockedFunction<typeof useUsdAmount>

const FEE_FIAT = CurrencyAmount.fromRawAmount(USDC_MAINNET, 2_500000n)

describe('useWaitAndSaveSaveAmount', () => {
  const state: {
    comparison: WaitAndSaveComparisonQuote | null
    enabled: boolean
    hasScheduleError: boolean
    mainBuyAmount: string
  } = {
    comparison: { buyAmount: '110', isOnQuote: true, mainBuyAmount: '100' },
    enabled: false,
    hasScheduleError: false,
    mainBuyAmount: '100',
  }

  beforeEach(() => {
    state.comparison = { buyAmount: '110', isOnQuote: true, mainBuyAmount: '100' }
    state.enabled = false
    state.hasScheduleError = false
    state.mainBuyAmount = '100'
    useAtomValueMock.mockImplementation((atom) => {
      if (atom === waitAndSaveEnabledAtom) return state.enabled
      if (atom === isCanonicalBatchScheduleErrorAtom) return state.hasScheduleError
      if (atom === waitAndSaveComparisonQuoteAtom) return state.comparison

      throw new Error('unexpected atom')
    })
    useDerivedTradeStateMock.mockReturnValue({
      outputCurrency: USDC_MAINNET,
    } as ReturnType<typeof useDerivedTradeState>)
    useTradeQuoteMock.mockImplementation(
      () =>
        ({
          quote: { quoteResults: { quoteResponse: { quote: { buyAmount: state.mainBuyAmount } } } },
        }) as ReturnType<typeof useTradeQuote>,
    )
    useUsdAmountMock.mockImplementation((amount) => ({
      isLoading: false,
      value: amount ? FEE_FIAT : null,
    }))
  })

  it('prices a positive on-quote minus off-quote buy amount', () => {
    const { result } = renderHook(() => useWaitAndSaveSaveAmount())

    expect(result.current).toBe(formatPositiveFiat(FEE_FIAT))
  })

  it('omits the amount when the delta is missing or not positive', () => {
    state.comparison = null
    expect(renderHook(() => useWaitAndSaveSaveAmount()).result.current).toBeUndefined()

    state.comparison = { buyAmount: '100', isOnQuote: true, mainBuyAmount: '100' }
    expect(renderHook(() => useWaitAndSaveSaveAmount()).result.current).toBeUndefined()

    state.comparison = { buyAmount: '90', isOnQuote: true, mainBuyAmount: '100' }
    expect(renderHook(() => useWaitAndSaveSaveAmount()).result.current).toBeUndefined()
  })

  it('omits the amount when the schedule failed', () => {
    state.hasScheduleError = true

    expect(renderHook(() => useWaitAndSaveSaveAmount()).result.current).toBeUndefined()
  })
})
