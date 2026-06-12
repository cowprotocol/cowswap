import { OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { TradeType } from 'modules/trade'
import { TradeQuoteState } from 'modules/tradeQuote'

import { validateTradeForm } from './validateTradeForm'

import { ApproveRequiredReason } from '../../erc20Approve'
import { TradeFormValidation, TradeFormValidationContext } from '../types'

const mockCurrencyAmount = (value: string): CurrencyAmount<Currency> =>
  ({
    toExact: () => value,
    equalTo: (other: unknown) => value === String(other),
    quotient: { toString: () => value },
    lessThan: (other: unknown) => Number(value) < Number((other as CurrencyAmount<Currency>).toExact()),
  }) as unknown as CurrencyAmount<Currency>

describe('validateTradeForm - xStock logic', () => {
  const baseContext: Partial<TradeFormValidationContext> = {
    derivedTradeState: {
      orderKind: OrderKind.SELL,
      inputCurrencyAmount: mockCurrencyAmount('100'),
      outputCurrencyAmount: mockCurrencyAmount('100'),
      inputCurrency: { address: '0x1', chainId: 1 } as unknown as Currency,
      outputCurrency: { address: '0x2', chainId: 1 } as unknown as Currency,
      inputCurrencyBalance: mockCurrencyAmount('1000'),
      outputCurrencyBalance: mockCurrencyAmount('1000'),
      inputCurrencyFiatAmount: null,
      outputCurrencyFiatAmount: null,
      recipient: '0x123',
      isQuoteBasedOrder: true,
      tradeType: TradeType.SWAP,
      slippage: null,
    },
    tradeQuote: { isLoading: false } as unknown as TradeQuoteState,
    isOnline: true,
    isSupportedWallet: true,
    account: '0x123',
    isApproveRequired: ApproveRequiredReason.NotRequired,
    isWrapUnwrap: false,
    isSafeReadonlyUser: false,
    isSwapUnsupported: false,
    recipientEnsAddress: null,
    isInsufficientBalanceOrderAllowed: false,
    isProviderNetworkUnsupported: false,
    isProviderNetworkDeprecated: false,
    intermediateTokenToBeImported: false,
    isAccountProxyLoading: false,
    isProxySetupValid: true,
    customTokenError: undefined,
    isRestrictedForCountry: false,
    isBalancesLoading: false,
    isBundlingSupported: true,
    isInputCurrencyXstock: false,
    isOutputCurrencyXstock: false,
    injectedWidgetParams: {},
    tradePriceImpact: { loading: false, priceImpact: undefined },
  }

  test('shows xStock minimum trade size for sell orders when xStock sell amount is below $10', () => {
    const context = {
      ...baseContext,
      isInputCurrencyXstock: true,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: mockCurrencyAmount('5'),
        outputCurrencyFiatAmount: mockCurrencyAmount('50'),
      },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result).toContain(TradeFormValidation.XstockMinimumTradeSize)
  })

  test('does not show xStock minimum trade size for sell orders when xStock sell amount is exactly $10', () => {
    const context = {
      ...baseContext,
      isInputCurrencyXstock: true,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: mockCurrencyAmount('10'),
        outputCurrencyFiatAmount: mockCurrencyAmount('50'),
      },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result).not.toContain(TradeFormValidation.XstockMinimumTradeSize)
  })

  test('does not show xStock minimum trade size for sell orders when xStock sell amount is above $10', () => {
    const context = {
      ...baseContext,
      isInputCurrencyXstock: true,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: mockCurrencyAmount('15'),
        outputCurrencyFiatAmount: mockCurrencyAmount('5'),
      },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result || []).not.toContain(TradeFormValidation.XstockMinimumTradeSize)
  })

  test('shows xStock minimum trade size for buy orders when xStock buy amount is below $10', () => {
    const context = {
      ...baseContext,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        orderKind: OrderKind.BUY,
        inputCurrencyFiatAmount: mockCurrencyAmount('50'),
        outputCurrencyFiatAmount: mockCurrencyAmount('5'),
      },
      isOutputCurrencyXstock: true,
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result).toContain(TradeFormValidation.XstockMinimumTradeSize)
  })

  test('does not show xStock minimum trade size for buy orders when xStock buy amount is above $10', () => {
    const context = {
      ...baseContext,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        orderKind: OrderKind.BUY,
        inputCurrencyFiatAmount: mockCurrencyAmount('5'),
        outputCurrencyFiatAmount: mockCurrencyAmount('15'),
      },
      isOutputCurrencyXstock: true,
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result || []).not.toContain(TradeFormValidation.XstockMinimumTradeSize)
  })

  test('shows xStock minimum trade size for sell orders when xStock is only on the buy side', () => {
    const context = {
      ...baseContext,
      isOutputCurrencyXstock: true,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: mockCurrencyAmount('5'),
        outputCurrencyFiatAmount: mockCurrencyAmount('5'),
      },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result).toContain(TradeFormValidation.XstockMinimumTradeSize)
  })

  test('shows xStock minimum trade size for buy orders when xStock is only on the sell side', () => {
    const context = {
      ...baseContext,
      isInputCurrencyXstock: true,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        orderKind: OrderKind.BUY,
        inputCurrencyFiatAmount: mockCurrencyAmount('5'),
        outputCurrencyFiatAmount: mockCurrencyAmount('5'),
      },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result).toContain(TradeFormValidation.XstockMinimumTradeSize)
  })

  test('prioritizes xStock minimum trade size over quote errors', () => {
    const context = {
      ...baseContext,
      isInputCurrencyXstock: true,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: mockCurrencyAmount('5'),
        outputCurrencyFiatAmount: mockCurrencyAmount('50'),
      },
      tradeQuote: {
        isLoading: false,
        error: new Error('Insufficient liquidity'),
      },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result).toEqual([TradeFormValidation.XstockMinimumTradeSize])
  })
})

describe('validateTradeForm - price impact loading', () => {
  const baseContext: Partial<TradeFormValidationContext> = {
    derivedTradeState: {
      orderKind: OrderKind.SELL,
      inputCurrencyAmount: mockCurrencyAmount('100'),
      outputCurrencyAmount: mockCurrencyAmount('100'),
      inputCurrency: { address: '0x1', chainId: 1 } as unknown as Currency,
      outputCurrency: { address: '0x2', chainId: 1 } as unknown as Currency,
      inputCurrencyBalance: mockCurrencyAmount('1000'),
      outputCurrencyBalance: mockCurrencyAmount('1000'),
      inputCurrencyFiatAmount: null,
      outputCurrencyFiatAmount: null,
      recipient: '0x123',
      isQuoteBasedOrder: true,
      tradeType: TradeType.SWAP,
      slippage: null,
    },
    tradeQuote: { isLoading: false, quote: {} } as unknown as TradeQuoteState,
    isOnline: true,
    isSupportedWallet: true,
    account: '0x123',
    isApproveRequired: ApproveRequiredReason.NotRequired,
    isWrapUnwrap: false,
    isSafeReadonlyUser: false,
    isSwapUnsupported: false,
    recipientEnsAddress: null,
    isInsufficientBalanceOrderAllowed: false,
    isProviderNetworkUnsupported: false,
    isProviderNetworkDeprecated: false,
    intermediateTokenToBeImported: false,
    isAccountProxyLoading: false,
    isProxySetupValid: true,
    customTokenError: undefined,
    isRestrictedForCountry: false,
    isBalancesLoading: false,
    isBundlingSupported: true,
    isInputCurrencyXstock: false,
    isOutputCurrencyXstock: false,
    injectedWidgetParams: {},
    tradePriceImpact: { loading: false, priceImpact: undefined },
    isNonEvmReceiverConfirmed: false,
  }

  test('adds ImpactLoading when tradePriceImpact is loading', () => {
    const context = {
      ...baseContext,
      tradePriceImpact: { loading: true, priceImpact: undefined },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result).toContain(TradeFormValidation.ImpactLoading)
  })

  test('does not add ImpactLoading when tradePriceImpact has finished loading', () => {
    const context = {
      ...baseContext,
      tradePriceImpact: { loading: false, priceImpact: undefined },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result || []).not.toContain(TradeFormValidation.ImpactLoading)
  })

  test('disables widget trade when price impact is unknown and widget requires known price impact', () => {
    const context = {
      ...baseContext,
      injectedWidgetParams: { disableTrade: { whenPriceImpactIsUnknown: true } },
      tradePriceImpact: { loading: false, priceImpact: undefined },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result).toContain(TradeFormValidation.DisableTradeWithUnknownPriceImpact)
    expect(result || []).not.toContain(TradeFormValidation.ImpactLoading)
  })

  test('does not add ImpactLoading for wrap/unwrap flow even if tradePriceImpact is loading', () => {
    const context = {
      ...baseContext,
      isWrapUnwrap: true,
      tradePriceImpact: { loading: true, priceImpact: undefined },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result || []).not.toContain(TradeFormValidation.ImpactLoading)
  })

  test('adds ImpactLoading alongside QuoteLoading when both are pending', () => {
    const context = {
      ...baseContext,
      tradeQuote: { isLoading: true, quote: undefined } as unknown as TradeQuoteState,
      tradePriceImpact: { loading: true, priceImpact: undefined },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result).toContain(TradeFormValidation.QuoteLoading)
    expect(result).toContain(TradeFormValidation.ImpactLoading)
  })
})
