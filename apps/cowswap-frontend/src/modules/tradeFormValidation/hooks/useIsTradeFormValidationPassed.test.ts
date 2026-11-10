import { renderHook } from '@testing-library/react'

import { TradeQuoteState, useTradeQuote } from 'modules/tradeQuote'

import { useGetTradeFormValidations } from './useGetTradeFormValidations'
import { useIsTradeFormValidationPassedOrRefreshing } from './useIsTradeFormValidationPassed'

import { TradeFormValidation } from '../types'

jest.mock('modules/tradeQuote', () => ({
  useTradeQuote: jest.fn(),
  getIsSameTradeQuoteRefreshing: jest.requireActual('modules/tradeQuote/utils/getAreAllQuotesReceived')
    .getIsSameTradeQuoteRefreshing,
}))

jest.mock('./useGetTradeFormValidations', () => ({
  useGetTradeFormValidations: jest.fn(),
}))

const mockedUseTradeQuote = useTradeQuote as jest.MockedFunction<typeof useTradeQuote>
const mockedUseGetTradeFormValidations = useGetTradeFormValidations as jest.MockedFunction<
  typeof useGetTradeFormValidations
>

const QUOTE = {} as NonNullable<TradeQuoteState['quote']>

function mockQuoteState(state: Partial<TradeQuoteState>): void {
  mockedUseTradeQuote.mockReturnValue({ quote: QUOTE, pendingQuotes: null, ...state } as TradeQuoteState)
}

function pendingRound(hasParamsChanged: boolean): TradeQuoteState['pendingQuotes'] {
  return { fetchStartTimestamp: 1, hasParamsChanged, requests: [] }
}

function renderPassedOrRefreshing(): boolean {
  return renderHook(() => useIsTradeFormValidationPassedOrRefreshing()).result.current
}

describe('useIsTradeFormValidationPassedOrRefreshing', () => {
  beforeEach(() => {
    mockQuoteState({})
  })

  it('is true when there is no validation', () => {
    mockedUseGetTradeFormValidations.mockReturnValue(null)

    expect(renderPassedOrRefreshing()).toBe(true)
  })

  it('is true while the quote of an unchanged trade is refreshing', () => {
    mockedUseGetTradeFormValidations.mockReturnValue([TradeFormValidation.QuoteLoading])
    mockQuoteState({ pendingQuotes: pendingRound(false) })

    expect(renderPassedOrRefreshing()).toBe(true)
  })

  it('is false while the quote is loading for changed params', () => {
    mockedUseGetTradeFormValidations.mockReturnValue([TradeFormValidation.QuoteLoading])
    mockQuoteState({ pendingQuotes: pendingRound(true) })

    expect(renderPassedOrRefreshing()).toBe(false)
  })

  it('is false while the first quote is loading', () => {
    mockedUseGetTradeFormValidations.mockReturnValue([TradeFormValidation.QuoteLoading])
    mockQuoteState({ quote: null, pendingQuotes: pendingRound(false) })

    expect(renderPassedOrRefreshing()).toBe(false)
  })

  it('is false for another blocking validation during a refresh', () => {
    mockedUseGetTradeFormValidations.mockReturnValue([TradeFormValidation.BalanceInsufficient])
    mockQuoteState({ pendingQuotes: pendingRound(false) })

    expect(renderPassedOrRefreshing()).toBe(false)
  })

  it('is false for a blocking validation behind the refreshing quote', () => {
    mockedUseGetTradeFormValidations.mockReturnValue([
      TradeFormValidation.QuoteLoading,
      TradeFormValidation.DisableTradeWithUnknownPriceImpact,
    ])
    mockQuoteState({ pendingQuotes: pendingRound(false) })

    expect(renderPassedOrRefreshing()).toBe(false)
  })

  it('is true for an approval behind the refreshing quote', () => {
    mockedUseGetTradeFormValidations.mockReturnValue([
      TradeFormValidation.QuoteLoading,
      TradeFormValidation.ApproveRequired,
    ])
    mockQuoteState({ pendingQuotes: pendingRound(false) })

    expect(renderPassedOrRefreshing()).toBe(true)
  })
})
