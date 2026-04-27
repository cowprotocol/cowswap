import { OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { getIsXstockTradeBelowLimit } from './getIsXstockTradeBelowLimit'

import { XSTOCK_MIN_TRADE_SIZE_USD } from '../consts'
import { TradeFormValidationContext } from '../types'

const mockFiatAmount = (value: string): CurrencyAmount<Currency> =>
  ({ toExact: () => value }) as unknown as CurrencyAmount<Currency>

const baseContext = (overrides: Partial<TradeFormValidationContext> = {}): TradeFormValidationContext =>
  ({
    isInputCurrencyXstock: false,
    isOutputCurrencyXstock: false,
    derivedTradeState: {
      orderKind: OrderKind.SELL,
      inputCurrencyFiatAmount: null,
      outputCurrencyFiatAmount: null,
    },
    ...overrides,
  }) as unknown as TradeFormValidationContext

describe('getIsXstockTradeBelowLimit', () => {
  describe('when no xstock token is involved', () => {
    it('returns false even if fiat amount is below limit', () => {
      const ctx = baseContext({
        isInputCurrencyXstock: false,
        isOutputCurrencyXstock: false,
        derivedTradeState: {
          orderKind: OrderKind.SELL,
          inputCurrencyFiatAmount: mockFiatAmount('1'),
          outputCurrencyFiatAmount: null,
        } as unknown as TradeFormValidationContext['derivedTradeState'],
      })
      expect(getIsXstockTradeBelowLimit(ctx)).toBe(false)
    })
  })

  describe('when input currency is xstock (SELL order)', () => {
    it('returns true when inputCurrencyFiatAmount is below limit', () => {
      const ctx = baseContext({
        isInputCurrencyXstock: true,
        derivedTradeState: {
          orderKind: OrderKind.SELL,
          inputCurrencyFiatAmount: mockFiatAmount(String(XSTOCK_MIN_TRADE_SIZE_USD - 1)),
          outputCurrencyFiatAmount: null,
        } as unknown as TradeFormValidationContext['derivedTradeState'],
      })
      expect(getIsXstockTradeBelowLimit(ctx)).toBe(true)
    })

    it('returns false when inputCurrencyFiatAmount equals limit', () => {
      const ctx = baseContext({
        isInputCurrencyXstock: true,
        derivedTradeState: {
          orderKind: OrderKind.SELL,
          inputCurrencyFiatAmount: mockFiatAmount(String(XSTOCK_MIN_TRADE_SIZE_USD)),
          outputCurrencyFiatAmount: null,
        } as unknown as TradeFormValidationContext['derivedTradeState'],
      })
      expect(getIsXstockTradeBelowLimit(ctx)).toBe(false)
    })

    it('returns false when inputCurrencyFiatAmount is above limit', () => {
      const ctx = baseContext({
        isInputCurrencyXstock: true,
        derivedTradeState: {
          orderKind: OrderKind.SELL,
          inputCurrencyFiatAmount: mockFiatAmount(String(XSTOCK_MIN_TRADE_SIZE_USD + 1)),
          outputCurrencyFiatAmount: null,
        } as unknown as TradeFormValidationContext['derivedTradeState'],
      })
      expect(getIsXstockTradeBelowLimit(ctx)).toBe(false)
    })

    it('returns false when inputCurrencyFiatAmount is null', () => {
      const ctx = baseContext({
        isInputCurrencyXstock: true,
        derivedTradeState: {
          orderKind: OrderKind.SELL,
          inputCurrencyFiatAmount: null,
          outputCurrencyFiatAmount: null,
        } as unknown as TradeFormValidationContext['derivedTradeState'],
      })
      expect(getIsXstockTradeBelowLimit(ctx)).toBe(false)
    })
  })

  describe('when output currency is xstock (BUY order)', () => {
    it('returns true when outputCurrencyFiatAmount is below limit', () => {
      const ctx = baseContext({
        isOutputCurrencyXstock: true,
        derivedTradeState: {
          orderKind: OrderKind.BUY,
          inputCurrencyFiatAmount: null,
          outputCurrencyFiatAmount: mockFiatAmount(String(XSTOCK_MIN_TRADE_SIZE_USD - 1)),
        } as unknown as TradeFormValidationContext['derivedTradeState'],
      })
      expect(getIsXstockTradeBelowLimit(ctx)).toBe(true)
    })

    it('returns false when outputCurrencyFiatAmount equals limit', () => {
      const ctx = baseContext({
        isOutputCurrencyXstock: true,
        derivedTradeState: {
          orderKind: OrderKind.BUY,
          inputCurrencyFiatAmount: null,
          outputCurrencyFiatAmount: mockFiatAmount(String(XSTOCK_MIN_TRADE_SIZE_USD)),
        } as unknown as TradeFormValidationContext['derivedTradeState'],
      })
      expect(getIsXstockTradeBelowLimit(ctx)).toBe(false)
    })

    it('returns false when outputCurrencyFiatAmount is null', () => {
      const ctx = baseContext({
        isOutputCurrencyXstock: true,
        derivedTradeState: {
          orderKind: OrderKind.BUY,
          inputCurrencyFiatAmount: null,
          outputCurrencyFiatAmount: null,
        } as unknown as TradeFormValidationContext['derivedTradeState'],
      })
      expect(getIsXstockTradeBelowLimit(ctx)).toBe(false)
    })
  })

  describe('multiplier', () => {
    it('scales the limit by the multiplier', () => {
      const multiplier = 2
      const ctx = baseContext({
        isInputCurrencyXstock: true,
        derivedTradeState: {
          orderKind: OrderKind.SELL,
          inputCurrencyFiatAmount: mockFiatAmount(String(XSTOCK_MIN_TRADE_SIZE_USD + 1)),
          outputCurrencyFiatAmount: null,
        } as unknown as TradeFormValidationContext['derivedTradeState'],
      })
      // amount (11) < limit (10) * multiplier (2) = 20 → true
      expect(getIsXstockTradeBelowLimit(ctx, multiplier)).toBe(true)
    })

    it('returns false when amount exceeds scaled limit', () => {
      const multiplier = 2
      const ctx = baseContext({
        isInputCurrencyXstock: true,
        derivedTradeState: {
          orderKind: OrderKind.SELL,
          inputCurrencyFiatAmount: mockFiatAmount(String(XSTOCK_MIN_TRADE_SIZE_USD * multiplier + 1)),
          outputCurrencyFiatAmount: null,
        } as unknown as TradeFormValidationContext['derivedTradeState'],
      })
      expect(getIsXstockTradeBelowLimit(ctx, multiplier)).toBe(false)
    })
  })

  describe('SELL order uses input fiat amount regardless of which token is xstock', () => {
    it('uses inputCurrencyFiatAmount for SELL order when output is xstock', () => {
      const ctx = baseContext({
        isOutputCurrencyXstock: true,
        derivedTradeState: {
          orderKind: OrderKind.SELL,
          inputCurrencyFiatAmount: mockFiatAmount(String(XSTOCK_MIN_TRADE_SIZE_USD - 1)),
          outputCurrencyFiatAmount: mockFiatAmount(String(XSTOCK_MIN_TRADE_SIZE_USD + 100)),
        } as unknown as TradeFormValidationContext['derivedTradeState'],
      })
      expect(getIsXstockTradeBelowLimit(ctx)).toBe(true)
    })
  })
})
