import { useAtomValue } from 'jotai'

import { USDC_MAINNET, WETH_MAINNET } from '@cowprotocol/common-const'
import { OrderKind } from '@cowprotocol/cow-sdk'
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

function comparison(overrides: Partial<WaitAndSaveComparisonQuote> = {}): WaitAndSaveComparisonQuote {
  return {
    buyAmount: '110',
    enableWaitForCow: true,
    feeAmount: '0',
    mainBuyAmount: '100',
    mainFeeAmount: '0',
    mainSellAmount: '1000',
    sellAmount: '1000',
    ...overrides,
  }
}

describe('useWaitAndSaveSaveAmount', () => {
  const state: {
    comparison: WaitAndSaveComparisonQuote | null
    hasScheduleError: boolean
    mainBuyAmount: string
    mainFeeAmount: string
    mainSellAmount: string
    orderKind: OrderKind
    userQuoteWithWaitAndSave: boolean
  } = {
    comparison: comparison(),
    hasScheduleError: false,
    mainBuyAmount: '100',
    mainFeeAmount: '0',
    mainSellAmount: '1000',
    orderKind: OrderKind.SELL,
    userQuoteWithWaitAndSave: false,
  }

  beforeEach(() => {
    state.comparison = comparison()
    state.hasScheduleError = false
    state.mainBuyAmount = '100'
    state.mainFeeAmount = '0'
    state.mainSellAmount = '1000'
    state.orderKind = OrderKind.SELL
    state.userQuoteWithWaitAndSave = false
    jest.mocked(useEnableWaitForCow).mockImplementation(() => state.userQuoteWithWaitAndSave)
    useAtomValueMock.mockImplementation((atom) => {
      if (atom === isCanonicalBatchScheduleErrorAtom) return state.hasScheduleError
      if (atom === waitAndSaveComparisonQuoteAtom) return state.comparison

      throw new Error('unexpected atom')
    })
    useDerivedTradeStateMock.mockImplementation(
      () =>
        ({
          inputCurrency: WETH_MAINNET,
          orderKind: state.orderKind,
          outputCurrency: USDC_MAINNET,
        }) as ReturnType<typeof useDerivedTradeState>,
    )
    useTradeQuoteMock.mockImplementation(
      () =>
        ({
          quote: {
            quoteResults: {
              quoteResponse: {
                quote: {
                  buyAmount: state.mainBuyAmount,
                  feeAmount: state.mainFeeAmount,
                  sellAmount: state.mainSellAmount,
                },
              },
            },
          },
        }) as ReturnType<typeof useTradeQuote>,
    )
    useUsdAmountMock.mockImplementation((amount) => ({
      isLoading: false,
      value: amount ? FEE_FIAT : null,
    }))
  })

  it('prices a positive on-quote minus off-quote buy amount', () => {
    const { result } = renderHook(() => useWaitAndSaveSaveAmount())
    const priced = useUsdAmountMock.mock.calls.at(-1)?.[0]

    expect(result.current).toBe(formatPositiveFiat(FEE_FIAT))
    expect(priced?.currency).toBe(USDC_MAINNET)
    expect(priced?.quotient.toString()).toBe('10')
  })

  it('prices a buy order from the gross sell amounts', () => {
    state.orderKind = OrderKind.BUY
    state.mainBuyAmount = '100'
    state.mainFeeAmount = '10'
    state.mainSellAmount = '1000'
    state.comparison = comparison({
      buyAmount: '100',
      feeAmount: '10',
      mainBuyAmount: '100',
      mainFeeAmount: '10',
      mainSellAmount: '1000',
      sellAmount: '900',
    })

    const { result } = renderHook(() => useWaitAndSaveSaveAmount())
    const priced = useUsdAmountMock.mock.calls.at(-1)?.[0]

    expect(result.current).toBe(formatPositiveFiat(FEE_FIAT))
    expect(priced?.currency).toBe(WETH_MAINNET)
    expect(priced?.quotient.toString()).toBe('100')
  })

  it('omits the amount when the delta is missing or not positive', () => {
    state.comparison = null
    expect(renderHook(() => useWaitAndSaveSaveAmount()).result.current).toBeUndefined()

    state.comparison = comparison({ buyAmount: '100' })
    expect(renderHook(() => useWaitAndSaveSaveAmount()).result.current).toBeUndefined()

    state.comparison = comparison({ buyAmount: '90' })
    expect(renderHook(() => useWaitAndSaveSaveAmount()).result.current).toBeUndefined()
  })

  it('omits the amount when the schedule failed', () => {
    state.hasScheduleError = true

    expect(renderHook(() => useWaitAndSaveSaveAmount()).result.current).toBeUndefined()
  })
})
