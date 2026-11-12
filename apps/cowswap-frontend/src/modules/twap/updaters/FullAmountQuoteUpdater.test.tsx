import { createStore, Provider } from 'jotai'
import { ReactNode } from 'react'

import { act, render } from '@testing-library/react'
import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useQuoteParams, useTradeQuote } from 'modules/tradeQuote'

import { FullAmountQuoteUpdater } from './FullAmountQuoteUpdater'

import { fullAmountQuoteAtom } from '../state/fullAmountQuoteAtom'

jest.mock('entities/captcha/state/captchaCanQuoteAtom', () => {
  const { atom } = jest.requireActual('jotai')

  return { captchaCanQuoteAtom: atom(true) }
})
jest.mock('tradingSdk/bridgingSdk', () => ({ bridgingSdk: { getQuote: jest.fn() } }))
jest.mock('tradingSdk/tradingSdk', () => ({ QUOTE_SETTINGS: {} }))
jest.mock('modules/advancedOrders', () => ({ useAdvancedOrdersDerivedState: jest.fn() }))
jest.mock('modules/tradeQuote', () => ({ useTradeQuote: jest.fn(), useQuoteParams: jest.fn() }))

type QuoteParams = NonNullable<ReturnType<typeof useQuoteParams>>['quoteParams']
type TradeQuote = ReturnType<typeof useTradeQuote>

const getQuoteMock = jest.mocked(bridgingSdk.getQuote)
const useTradeQuoteMock = jest.mocked(useTradeQuote)
const useQuoteParamsMock = jest.mocked(useQuoteParams)
const useAdvancedOrdersDerivedStateMock = jest.mocked(useAdvancedOrdersDerivedState)

// Full amount of 1 WETH, quoted as a whole at 1500 USDC (750 USDC per part with 2 parts)
const PARAMS_1_WETH = { amount: BigInt(1e18) } as unknown as QuoteParams
// Full amount of 10 WETH (7500 USDC per part with 2 parts)
const PARAMS_10_WETH = { amount: BigInt(10e18) } as unknown as QuoteParams

function fullQuoteResponse(buyAmount: string): unknown {
  return { quoteResults: { quoteResponse: { quote: { buyAmount } } } }
}

function pending(): { promise: Promise<never>; resolve: (value: unknown) => void } {
  let resolve: (value: unknown) => void = () => undefined
  const promise = new Promise<never>((r) => {
    resolve = r as (value: unknown) => void
  })

  return { promise, resolve }
}

function setFormState(quoteParams: QuoteParams, partBuyAmount: string, isLoading = false): void {
  useAdvancedOrdersDerivedStateMock.mockReturnValue({
    inputCurrencyAmount: { quotient: quoteParams?.amount },
  } as unknown as ReturnType<typeof useAdvancedOrdersDerivedState>)
  useQuoteParamsMock.mockReturnValue({ quoteParams } as ReturnType<typeof useQuoteParams>)
  useTradeQuoteMock.mockReturnValue(tradeQuote(partBuyAmount, isLoading))
}

function tradeQuote(partBuyAmount: string, isLoading = false): TradeQuote {
  return {
    quote: { quoteResults: { quoteResponse: { quote: { buyAmount: partBuyAmount } } } },
    error: null,
    isLoading,
  } as unknown as TradeQuote
}

describe('FullAmountQuoteUpdater', () => {
  let store: ReturnType<typeof createStore>

  function wrapper({ children }: { children: ReactNode }): ReactNode {
    return <Provider store={store}>{children}</Provider>
  }

  function storedFullQuoteBuyAmount(): string | undefined {
    return store.get(fullAmountQuoteAtom)?.quote.buyAmount
  }

  async function renderWithFullQuoteFor1Weth(): Promise<ReturnType<typeof render>> {
    setFormState(PARAMS_1_WETH, '750000000')
    getQuoteMock.mockResolvedValueOnce(fullQuoteResponse('1500000000') as never)

    const view = render(<FullAmountQuoteUpdater />, { wrapper })
    await act(async () => undefined)

    expect(storedFullQuoteBuyAmount()).toBe('1500000000')

    return view
  }

  beforeEach(() => {
    jest.clearAllMocks()
    store = createStore()
  })

  it('stores the full-amount quote for the current amount', async () => {
    await renderWithFullQuoteFor1Weth()

    expect(getQuoteMock).toHaveBeenCalledWith(PARAMS_1_WETH, {})
  })

  it('drops the previous full-amount quote while the quote for a new amount is loading', async () => {
    const view = await renderWithFullQuoteFor1Weth()

    // The part quote for 10 WETH has arrived, the full-amount quote for 10 WETH is still in flight
    getQuoteMock.mockReturnValueOnce(pending().promise)
    setFormState(PARAMS_10_WETH, '7500000000')
    view.rerender(<FullAmountQuoteUpdater />)
    await act(async () => undefined)

    expect(getQuoteMock).toHaveBeenLastCalledWith(PARAMS_10_WETH, {})
    // The 1 WETH quote must not be compared against the 10 WETH parts
    expect(storedFullQuoteBuyAmount()).toBeUndefined()
  })

  it('does not keep the previous full-amount quote when the quote for a new amount fails', async () => {
    const view = await renderWithFullQuoteFor1Weth()
    jest.spyOn(console, 'error').mockImplementation(() => undefined)

    getQuoteMock.mockRejectedValueOnce(new Error('NoLiquidity'))
    setFormState(PARAMS_10_WETH, '7500000000')
    view.rerender(<FullAmountQuoteUpdater />)
    await act(async () => undefined)

    expect(storedFullQuoteBuyAmount()).toBeUndefined()
  })

  it('ignores a full-amount quote that resolves after the amount has changed', async () => {
    setFormState(PARAMS_1_WETH, '750000000')
    const request = pending()
    getQuoteMock.mockReturnValueOnce(request.promise)

    const view = render(<FullAmountQuoteUpdater />, { wrapper })
    await act(async () => undefined)

    // Amount changed to 10 WETH, its part quote is still loading
    setFormState(PARAMS_10_WETH, '750000000', true)
    view.rerender(<FullAmountQuoteUpdater />)
    await act(async () => {
      request.resolve(fullQuoteResponse('1500000000'))
    })

    expect(storedFullQuoteBuyAmount()).toBeUndefined()
  })
})
