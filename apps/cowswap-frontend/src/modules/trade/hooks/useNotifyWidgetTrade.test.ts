import { USDC_MAINNET } from '@cowprotocol/common-const'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token, CurrencyAmount } from '@cowprotocol/currency'
import { CowWidgetEvents } from '@cowprotocol/events'
import { UiOrderType } from '@cowprotocol/types'

import { renderHook } from '@testing-library/react'
import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import { useAmountsToSignFromQuote } from './useAmountsToSignFromQuote'
import { useDerivedTradeState } from './useDerivedTradeState'
import { useNotifyWidgetTrade } from './useNotifyWidgetTrade'

import { TradeType } from '../types'

jest.mock('widgetEventEmitter', () => ({
  WIDGET_EVENT_EMITTER: {
    emit: jest.fn(),
  },
}))

jest.mock('./useDerivedTradeState', () => ({
  useDerivedTradeState: jest.fn(),
}))

jest.mock('./useAmountsToSignFromQuote', () => ({
  useAmountsToSignFromQuote: jest.fn(),
}))

const mockedUseDerivedTradeState = useDerivedTradeState as jest.MockedFunction<typeof useDerivedTradeState>
const mockedUseAmountsToSignFromQuote = useAmountsToSignFromQuote as jest.MockedFunction<
  typeof useAmountsToSignFromQuote
>
const mockedEmit = WIDGET_EVENT_EMITTER.emit as jest.Mock

const SELL_TOKEN = new Token(
  SupportedChainId.MAINNET,
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  18,
  'DAI',
  'Dai Stablecoin',
)
const BUY_TOKEN = USDC_MAINNET

const SELL_AMOUNT = CurrencyAmount.fromRawAmount(SELL_TOKEN, '1000000000000000000') // 1 DAI
const BUY_AMOUNT = CurrencyAmount.fromRawAmount(BUY_TOKEN, '1000000') // 1 USDC

const BASE_STATE = {
  inputCurrency: SELL_TOKEN,
  outputCurrency: BUY_TOKEN,
  inputCurrencyAmount: SELL_AMOUNT,
  outputCurrencyAmount: BUY_AMOUNT,
  inputCurrencyBalance: null,
  outputCurrencyBalance: null,
  inputCurrencyFiatAmount: null,
  outputCurrencyFiatAmount: null,
  recipient: null,
  recipientAddress: null,
  orderKind: OrderKind.SELL,
  slippage: null,
  tradeType: TradeType.SWAP,
  isQuoteBasedOrder: true,
}

describe('useNotifyWidgetTrade', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseAmountsToSignFromQuote.mockReturnValue(null)
  })

  it('emits ON_CHANGE_TRADE_PARAMS with correct payload for a swap', () => {
    mockedUseDerivedTradeState.mockReturnValue(BASE_STATE as never)

    renderHook(() => useNotifyWidgetTrade())

    expect(mockedEmit).toHaveBeenCalledTimes(1)
    expect(mockedEmit).toHaveBeenCalledWith(CowWidgetEvents.ON_CHANGE_TRADE_PARAMS, {
      orderType: UiOrderType.SWAP,
      orderKind: OrderKind.SELL,
      sellToken: {
        address: SELL_TOKEN.address,
        chainId: SELL_TOKEN.chainId,
        name: SELL_TOKEN.name,
        decimals: SELL_TOKEN.decimals,
        symbol: SELL_TOKEN.symbol,
      },
      buyToken: {
        address: BUY_TOKEN.address,
        chainId: BUY_TOKEN.chainId,
        name: BUY_TOKEN.name,
        decimals: BUY_TOKEN.decimals,
        symbol: BUY_TOKEN.symbol,
      },
      sellTokenAmount: { atoms: BigInt(SELL_AMOUNT.quotient.toString()), units: SELL_AMOUNT.toExact() },
      buyTokenAmount: { atoms: BigInt(BUY_AMOUNT.quotient.toString()), units: BUY_AMOUNT.toExact() },
      sellTokenBalance: undefined,
      buyTokenBalance: undefined,
      sellTokenFiatAmount: undefined,
      buyTokenFiatAmount: undefined,
      maximumSendSellAmount: { atoms: BigInt(0), units: '0' },
      minimumReceiveBuyAmount: { atoms: BigInt(0), units: '0' },
      recipient: undefined,
    })
  })

  it('uses ZERO_AMOUNT for maximumSendSellAmount and minimumReceiveBuyAmount when amountsToSign is null', () => {
    mockedUseDerivedTradeState.mockReturnValue(BASE_STATE as never)
    mockedUseAmountsToSignFromQuote.mockReturnValue(null)

    renderHook(() => useNotifyWidgetTrade())

    const [, payload] = mockedEmit.mock.calls[0]
    expect(payload.maximumSendSellAmount).toEqual({ atoms: BigInt(0), units: '0' })
    expect(payload.minimumReceiveBuyAmount).toEqual({ atoms: BigInt(0), units: '0' })
  })

  it('uses amountsToSign values when provided', () => {
    const maxSellAmount = CurrencyAmount.fromRawAmount(SELL_TOKEN, '1050000000000000000') // 1.05 DAI (with slippage)
    const minBuyAmount = CurrencyAmount.fromRawAmount(BUY_TOKEN, '990000') // 0.99 USDC (with slippage)

    mockedUseDerivedTradeState.mockReturnValue(BASE_STATE as never)
    mockedUseAmountsToSignFromQuote.mockReturnValue({
      maximumSendSellAmount: maxSellAmount,
      minimumReceiveBuyAmount: minBuyAmount,
    })

    renderHook(() => useNotifyWidgetTrade())

    const [, payload] = mockedEmit.mock.calls[0]
    expect(payload.maximumSendSellAmount).toEqual({
      atoms: BigInt(maxSellAmount.quotient.toString()),
      units: maxSellAmount.toExact(),
    })
    expect(payload.minimumReceiveBuyAmount).toEqual({
      atoms: BigInt(minBuyAmount.quotient.toString()),
      units: minBuyAmount.toExact(),
    })
  })

  it('maps TradeType.LIMIT_ORDER to UiOrderType.LIMIT', () => {
    mockedUseDerivedTradeState.mockReturnValue({ ...BASE_STATE, tradeType: TradeType.LIMIT_ORDER } as never)

    renderHook(() => useNotifyWidgetTrade())

    const [, payload] = mockedEmit.mock.calls[0]
    expect(payload.orderType).toBe(UiOrderType.LIMIT)
  })

  it('maps TradeType.ADVANCED_ORDERS to UiOrderType.TWAP', () => {
    mockedUseDerivedTradeState.mockReturnValue({ ...BASE_STATE, tradeType: TradeType.ADVANCED_ORDERS } as never)

    renderHook(() => useNotifyWidgetTrade())

    const [, payload] = mockedEmit.mock.calls[0]
    expect(payload.orderType).toBe(UiOrderType.TWAP)
  })

  it('includes recipient when set', () => {
    const recipient = '0xRecipientAddress'
    mockedUseDerivedTradeState.mockReturnValue({ ...BASE_STATE, recipient } as never)

    renderHook(() => useNotifyWidgetTrade())

    const [, payload] = mockedEmit.mock.calls[0]
    expect(payload.recipient).toBe(recipient)
  })

  it('includes fiat amounts when set', () => {
    const fiatAmount = CurrencyAmount.fromRawAmount(SELL_TOKEN, '1000000000000000000')
    mockedUseDerivedTradeState.mockReturnValue({
      ...BASE_STATE,
      inputCurrencyFiatAmount: fiatAmount,
      outputCurrencyFiatAmount: fiatAmount,
    } as never)

    renderHook(() => useNotifyWidgetTrade())

    const [, payload] = mockedEmit.mock.calls[0]
    expect(payload.sellTokenFiatAmount).toBe(fiatAmount.toExact())
    expect(payload.buyTokenFiatAmount).toBe(fiatAmount.toExact())
  })

  it('includes balance amounts when set', () => {
    const balance = CurrencyAmount.fromRawAmount(SELL_TOKEN, '5000000000000000000')
    mockedUseDerivedTradeState.mockReturnValue({
      ...BASE_STATE,
      inputCurrencyBalance: balance,
      outputCurrencyBalance: balance,
    } as never)

    renderHook(() => useNotifyWidgetTrade())

    const [, payload] = mockedEmit.mock.calls[0]
    expect(payload.sellTokenBalance).toEqual({
      atoms: BigInt(balance.quotient.toString()),
      units: balance.toExact(),
    })
    expect(payload.buyTokenBalance).toEqual({
      atoms: BigInt(balance.quotient.toString()),
      units: balance.toExact(),
    })
  })

  it('re-emits when state changes', () => {
    mockedUseDerivedTradeState.mockReturnValue(BASE_STATE as never)

    const { rerender } = renderHook(() => useNotifyWidgetTrade())
    expect(mockedEmit).toHaveBeenCalledTimes(1)

    const updatedState = { ...BASE_STATE, orderKind: OrderKind.BUY }
    mockedUseDerivedTradeState.mockReturnValue(updatedState as never)

    rerender()
    expect(mockedEmit).toHaveBeenCalledTimes(2)
  })
})
