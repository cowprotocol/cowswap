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
    customTokenError: null,
    isRestrictedForCountry: false,
    isBalancesLoading: false,
    isBundlingSupported: true,
  }

  test('should show xStock minimum trade size error if below limit', () => {
    const context = {
      ...baseContext,
      isOutputCurrencyXstock: true,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: mockCurrencyAmount('5'),
        outputCurrencyFiatAmount: null,
      },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result).toContain(TradeFormValidation.XstockMinimumTradeSize)
  })

  test('should NOT show xStock minimum trade size error if exactly $10', () => {
    const context = {
      ...baseContext,
      isOutputCurrencyXstock: true,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: mockCurrencyAmount('10'),
        outputCurrencyFiatAmount: null,
      },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result || []).not.toContain(TradeFormValidation.XstockMinimumTradeSize)
  })

  test('should NOT show xStock minimum trade size error if above $10', () => {
    const context = {
      ...baseContext,
      isOutputCurrencyXstock: true,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: mockCurrencyAmount('15'),
        outputCurrencyFiatAmount: null,
      },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result || []).not.toContain(TradeFormValidation.XstockMinimumTradeSize)
  })

  test('should use output amount if available', () => {
    const context = {
      ...baseContext,
      isOutputCurrencyXstock: true,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: mockCurrencyAmount('15'),
        outputCurrencyFiatAmount: mockCurrencyAmount('5'),
      },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result).toContain(TradeFormValidation.XstockMinimumTradeSize)
  })

  test('should show error if amount is 0', () => {
    const context = {
      ...baseContext,
      isOutputCurrencyXstock: true,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: mockCurrencyAmount('0'),
        outputCurrencyFiatAmount: null,
      },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result).toContain(TradeFormValidation.XstockMinimumTradeSize)
  })

  test('should prioritize xStock error over quote errors', () => {
    const context = {
      ...baseContext,
      isOutputCurrencyXstock: true,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: mockCurrencyAmount('5'),
        outputCurrencyFiatAmount: null,
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
