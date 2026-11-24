import { useAtomValue } from 'jotai'

import { USDC_MAINNET } from '@cowprotocol/common-const'
import { CurrencyAmount } from '@cowprotocol/currency'

import { renderHook } from '@testing-library/react'

import { useEnableWaitForCow } from 'modules/appData'
import {
  formatPositiveFiat,
  isCanonicalBatchScheduleErrorAtom,
  useDerivedTradeState,
  waitAndSaveComparisonQuoteAtom,
  type WaitAndSaveComparisonQuote,
} from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { useUsdAmount } from 'modules/usdAmount'

import { useWaitAndSaveSaveAmount } from './useWaitAndSaveSaveAmount'

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: jest.fn(),
}))

jest.mock('modules/appData', () => ({
  useEnableWaitForCow: jest.fn(),
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
    hasScheduleError: boolean
    mainBuyAmount: string
    userQuoteWithWaitAndSave: boolean
  } = {
    comparison: { buyAmount: '110', enableWaitForCow: true, mainBuyAmount: '100' },
    hasScheduleError: false,
    mainBuyAmount: '100',
    userQuoteWithWaitAndSave: false,
  }

  beforeEach(() => {
    state.comparison = { buyAmount: '110', enableWaitForCow: true, mainBuyAmount: '100' }
    state.hasScheduleError = false
    state.mainBuyAmount = '100'
    state.userQuoteWithWaitAndSave = false
    jest.mocked(useEnableWaitForCow).mockImplementation(() => state.userQuoteWithWaitAndSave)
    useAtomValueMock.mockImplementation((atom) => {
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

    state.comparison = { buyAmount: '100', enableWaitForCow: true, mainBuyAmount: '100' }
    expect(renderHook(() => useWaitAndSaveSaveAmount()).result.current).toBeUndefined()

    state.comparison = { buyAmount: '90', enableWaitForCow: true, mainBuyAmount: '100' }
    expect(renderHook(() => useWaitAndSaveSaveAmount()).result.current).toBeUndefined()
  })

  it('omits the amount when the schedule failed', () => {
    state.hasScheduleError = true

    expect(renderHook(() => useWaitAndSaveSaveAmount()).result.current).toBeUndefined()
  })
})
