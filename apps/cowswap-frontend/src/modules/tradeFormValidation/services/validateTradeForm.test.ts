import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { OrderKind, PriceQuality, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { TradeQuoteState } from 'modules/tradeQuote'

import { TradeType } from 'common/modules/tradeNavigation'

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
    isCaptchaPending: false,
    isCaptchaRequired: false,
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

  test('prioritizes pending CAPTCHA over wallet connection', () => {
    const context = {
      ...baseContext,
      account: undefined,
      isCaptchaPending: true,
    } as unknown as TradeFormValidationContext

    expect(validateTradeForm(context)).toEqual([TradeFormValidation.CaptchaPending])
  })

  test('prioritizes required CAPTCHA over wallet connection', () => {
    const context = {
      ...baseContext,
      account: undefined,
      isCaptchaRequired: true,
    } as unknown as TradeFormValidationContext

    expect(validateTradeForm(context)).toEqual([TradeFormValidation.CaptchaRequired])
  })
})

describe('validateTradeForm - Solana Alpha trade limit', () => {
  const baseContext: Partial<TradeFormValidationContext> = {
    derivedTradeState: {
      orderKind: OrderKind.SELL,
      inputCurrencyAmount: mockCurrencyAmount('100'),
      outputCurrencyAmount: mockCurrencyAmount('100'),
      inputCurrency: { address: '0x1', chainId: SupportedChainId.SOLANA } as unknown as Currency,
      outputCurrency: { address: '0x2', chainId: SupportedChainId.SOLANA } as unknown as Currency,
      inputCurrencyBalance: mockCurrencyAmount('100000'),
      outputCurrencyBalance: mockCurrencyAmount('100000'),
      inputCurrencyFiatAmount: null,
      outputCurrencyFiatAmount: null,
      recipient: null,
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
    isCaptchaPending: false,
    isCaptchaRequired: false,
  }

  test('shows the trade limit for sell orders when the sell amount is above $10,000', () => {
    const context = {
      ...baseContext,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: mockCurrencyAmount('25000'),
        outputCurrencyFiatAmount: mockCurrencyAmount('24990'),
      },
    } as unknown as TradeFormValidationContext

    expect(validateTradeForm(context)).toEqual([TradeFormValidation.SolanaAlphaMaxTradeSize])
  })

  test('does not show the trade limit when the sell amount is exactly $10,000', () => {
    const context = {
      ...baseContext,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: mockCurrencyAmount('10000'),
        outputCurrencyFiatAmount: mockCurrencyAmount('9990'),
      },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result || []).not.toContain(TradeFormValidation.SolanaAlphaMaxTradeSize)
  })

  test('does not show the trade limit when the sell amount is below $10,000', () => {
    const context = {
      ...baseContext,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: mockCurrencyAmount('100'),
        outputCurrencyFiatAmount: mockCurrencyAmount('99'),
      },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result || []).not.toContain(TradeFormValidation.SolanaAlphaMaxTradeSize)
  })

  test('does not apply the limit on EVM chains', () => {
    const context = {
      ...baseContext,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrency: { address: '0x1', chainId: SupportedChainId.MAINNET } as unknown as Currency,
        outputCurrency: { address: '0x2', chainId: SupportedChainId.MAINNET } as unknown as Currency,
        inputCurrencyFiatAmount: mockCurrencyAmount('25000'),
        outputCurrencyFiatAmount: mockCurrencyAmount('24990'),
      },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result || []).not.toContain(TradeFormValidation.SolanaAlphaMaxTradeSize)
  })

  test('uses the buy-side USD amount for buy orders', () => {
    const context = {
      ...baseContext,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        orderKind: OrderKind.BUY,
        inputCurrencyFiatAmount: mockCurrencyAmount('100'),
        outputCurrencyFiatAmount: mockCurrencyAmount('25000'),
      },
    } as unknown as TradeFormValidationContext

    expect(validateTradeForm(context)).toEqual([TradeFormValidation.SolanaAlphaMaxTradeSize])
  })

  test('prioritizes the trade limit over quote errors', () => {
    const context = {
      ...baseContext,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: mockCurrencyAmount('25000'),
        outputCurrencyFiatAmount: mockCurrencyAmount('24990'),
      },
      tradeQuote: {
        isLoading: false,
        error: new Error('Insufficient liquidity'),
      },
    } as unknown as TradeFormValidationContext

    expect(validateTradeForm(context)).toEqual([TradeFormValidation.SolanaAlphaMaxTradeSize])
  })

  test('blocks the trade when the USD value of the sell amount is unknown', () => {
    const context = {
      ...baseContext,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: null,
        outputCurrencyFiatAmount: null,
      },
    } as unknown as TradeFormValidationContext

    expect(validateTradeForm(context)).toEqual([TradeFormValidation.SolanaAlphaUnknownUsdValue])
  })

  test('blocks the trade when only the sell amount USD value is unknown', () => {
    const context = {
      ...baseContext,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: null,
        outputCurrencyFiatAmount: mockCurrencyAmount('100'),
      },
    } as unknown as TradeFormValidationContext

    expect(validateTradeForm(context)).toEqual([TradeFormValidation.SolanaAlphaUnknownUsdValue])
  })

  test('falls back to the sell-side USD amount for buy orders when the buy-side one is unknown', () => {
    const context = {
      ...baseContext,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        orderKind: OrderKind.BUY,
        inputCurrencyFiatAmount: mockCurrencyAmount('25000'),
        outputCurrencyFiatAmount: null,
      },
    } as unknown as TradeFormValidationContext

    expect(validateTradeForm(context)).toEqual([TradeFormValidation.SolanaAlphaMaxTradeSize])
  })

  test('shows impact loading instead of the unknown USD value while price impact is loading', () => {
    const context = {
      ...baseContext,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: null,
        outputCurrencyFiatAmount: null,
      },
      tradePriceImpact: { loading: true, priceImpact: undefined },
    } as unknown as TradeFormValidationContext

    expect(validateTradeForm(context)).toEqual([TradeFormValidation.ImpactLoading])
  })

  test('shows quote errors for buy orders whose sell amount has not been quoted yet', () => {
    const context = {
      ...baseContext,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        orderKind: OrderKind.BUY,
        inputCurrencyAmount: null,
        inputCurrencyFiatAmount: null,
        outputCurrencyFiatAmount: mockCurrencyAmount('100'),
      },
      tradeQuote: {
        isLoading: false,
        error: new Error('Insufficient liquidity'),
      },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context) || []
    expect(result).toContain(TradeFormValidation.QuoteErrors)
    expect(result).not.toContain(TradeFormValidation.SolanaAlphaUnknownUsdValue)
  })

  test('does not block EVM trades with an unknown USD value', () => {
    const context = {
      ...baseContext,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrency: { address: '0x1', chainId: SupportedChainId.MAINNET } as unknown as Currency,
        outputCurrency: { address: '0x2', chainId: SupportedChainId.MAINNET } as unknown as Currency,
        inputCurrencyFiatAmount: null,
        outputCurrencyFiatAmount: null,
      },
    } as unknown as TradeFormValidationContext

    expect(validateTradeForm(context) || []).not.toContain(TradeFormValidation.SolanaAlphaUnknownUsdValue)
  })

  test('does not apply the cap to wrap/unwrap, where fiat amounts are always null', () => {
    const context = {
      ...baseContext,
      isWrapUnwrap: true,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: null,
        outputCurrencyFiatAmount: null,
      },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context) || []
    expect(result).toContain(TradeFormValidation.WrapUnwrapFlow)
    expect(result).not.toContain(TradeFormValidation.SolanaAlphaMaxTradeSize)
    expect(result).not.toContain(TradeFormValidation.SolanaAlphaUnknownUsdValue)
  })

  test('prioritizes wallet connection over the trade limit', () => {
    const context = {
      ...baseContext,
      account: undefined,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: mockCurrencyAmount('25000'),
        outputCurrencyFiatAmount: mockCurrencyAmount('24990'),
      },
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context) || []
    expect(result[0]).toBe(TradeFormValidation.WalletNotConnected)
    expect(result).not.toContain(TradeFormValidation.SolanaAlphaMaxTradeSize)
  })
})

describe('validateTradeForm - balance vs slippage', () => {
  const baseContext: Partial<TradeFormValidationContext> = {
    derivedTradeState: {
      orderKind: OrderKind.BUY,
      inputCurrencyAmount: mockCurrencyAmount('100'),
      outputCurrencyAmount: mockCurrencyAmount('100'),
      inputCurrency: { address: '0x1', chainId: 1 } as unknown as Currency,
      outputCurrency: { address: '0x2', chainId: 1 } as unknown as Currency,
      inputCurrencyBalance: mockCurrencyAmount('120'),
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
    isCaptchaPending: false,
    isCaptchaRequired: false,
  }

  // balance (120) covers the raw input amount (100) but not the slippage-inclusive maximum sell amount (150)
  test('shows BalanceInsufficient for swap when balance covers input amount but not maximum sell amount with slippage', () => {
    const context = {
      ...baseContext,
      swapMaximumSellAmount: mockCurrencyAmount('150'),
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result).toContain(TradeFormValidation.BalanceInsufficient)
  })

  test('does not show BalanceInsufficient for swap when balance covers the maximum sell amount with slippage', () => {
    const context = {
      ...baseContext,
      swapMaximumSellAmount: mockCurrencyAmount('110'),
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result || []).not.toContain(TradeFormValidation.BalanceInsufficient)
  })

  test('falls back to raw input amount when swapMaximumSellAmount is not provided (e.g. limit/TWAP orders)', () => {
    const context = {
      ...baseContext,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        tradeType: TradeType.LIMIT_ORDER,
      },
      swapMaximumSellAmount: null,
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result || []).not.toContain(TradeFormValidation.BalanceInsufficient)
  })

  test('shows SolanaInsufficientNativeBalance when the wallet cannot cover rent and fees on top of the sell amount', () => {
    const context = {
      ...baseContext,
      swapMaximumSellAmount: mockCurrencyAmount('110'),
      solanaNativeShortfall: mockCurrencyAmount('5000'),
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result).toContain(TradeFormValidation.SolanaInsufficientNativeBalance)
  })

  test('does not show SolanaInsufficientNativeBalance when there is no shortfall', () => {
    const context = {
      ...baseContext,
      swapMaximumSellAmount: mockCurrencyAmount('110'),
      solanaNativeShortfall: null,
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result || []).not.toContain(TradeFormValidation.SolanaInsufficientNativeBalance)
  })

  // A Solana limit order pays the order PDA's rent and the fee at signing time, so the
  // place-without-balance convention must not lift this check.
  test('shows SolanaInsufficientNativeBalance for a limit order even when placing without balance is allowed', () => {
    const context = {
      ...baseContext,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        tradeType: TradeType.LIMIT_ORDER,
      },
      isInsufficientBalanceOrderAllowed: true,
      swapMaximumSellAmount: null,
      solanaNativeShortfall: mockCurrencyAmount('5000'),
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context)
    expect(result).toContain(TradeFormValidation.SolanaInsufficientNativeBalance)
  })

  // A wrap/unwrap is a plain owner-paid transaction: when the wallet cannot cover its fee and own
  // rent-exempt reserve, the shortfall button must win over the Wrap/Unwrap action button —
  // `useGetTradeFormValidation` picks validations[0].
  test('ranks SolanaInsufficientNativeBalance ahead of WrapUnwrapFlow in wrap/unwrap mode', () => {
    const context = {
      ...baseContext,
      isWrapUnwrap: true,
      solanaNativeShortfall: mockCurrencyAmount('5000'),
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context) || []
    expect(result).toContain(TradeFormValidation.WrapUnwrapFlow)
    expect(result.indexOf(TradeFormValidation.SolanaInsufficientNativeBalance)).toBeLessThan(
      result.indexOf(TradeFormValidation.WrapUnwrapFlow),
    )
  })

  test('ranks BalanceInsufficient ahead of SolanaInsufficientNativeBalance when both apply', () => {
    const context = {
      ...baseContext,
      swapMaximumSellAmount: mockCurrencyAmount('150'),
      solanaNativeShortfall: mockCurrencyAmount('5000'),
    } as unknown as TradeFormValidationContext

    const result = validateTradeForm(context) || []
    expect(result.indexOf(TradeFormValidation.BalanceInsufficient)).toBeLessThan(
      result.indexOf(TradeFormValidation.SolanaInsufficientNativeBalance),
    )
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

describe('validateTradeForm - Solana swap recipient', () => {
  const SOLANA_RECIPIENT = '4wtw5VHUq8DriYRh92LGDDeN4AemUrGKYFSaZcDx8z7s'
  const EVM_RECIPIENT = '0x1234567890123456789012345678901234567890'

  const baseContext: Partial<TradeFormValidationContext> = {
    derivedTradeState: {
      orderKind: OrderKind.SELL,
      inputCurrencyAmount: mockCurrencyAmount('100'),
      outputCurrencyAmount: mockCurrencyAmount('100'),
      inputCurrency: {
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        chainId: SupportedChainId.SOLANA,
      } as unknown as Currency,
      outputCurrency: {
        address: 'So11111111111111111111111111111111111111112',
        chainId: SupportedChainId.SOLANA,
      } as unknown as Currency,
      inputCurrencyBalance: mockCurrencyAmount('1000'),
      outputCurrencyBalance: mockCurrencyAmount('1000'),
      inputCurrencyFiatAmount: mockCurrencyAmount('1'),
      outputCurrencyFiatAmount: null,
      recipient: null,
      isQuoteBasedOrder: true,
      tradeType: TradeType.SWAP,
      slippage: null,
    },
    tradeQuote: { isLoading: false, quote: {} } as unknown as TradeQuoteState,
    isOnline: true,
    isSupportedWallet: true,
    account: 'BYXaGFW8VavtBLu56a53wuUZyRqp9b8ibRR2dojVTWv7',
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

  function withRecipient(recipient: string): TradeFormValidationContext {
    return {
      ...baseContext,
      derivedTradeState: { ...baseContext.derivedTradeState, recipient },
    } as unknown as TradeFormValidationContext
  }

  test('accepts a Solana address as recipient', () => {
    const result = validateTradeForm(withRecipient(SOLANA_RECIPIENT))
    expect(result || []).not.toContain(TradeFormValidation.RecipientInvalid)
  })

  test('rejects an EVM address as recipient', () => {
    const result = validateTradeForm(withRecipient(EVM_RECIPIENT))
    expect(result).toContain(TradeFormValidation.RecipientInvalid)
  })

  test('rejects an ENS name as recipient even when it resolves', () => {
    const result = validateTradeForm({
      ...withRecipient('vitalik.eth'),
      recipientEnsAddress: EVM_RECIPIENT,
    })
    expect(result).toContain(TradeFormValidation.RecipientInvalid)
  })

  describe('quote loading', () => {
    function withPendingQuotes(
      pendingQuotes: TradeQuoteState['pendingQuotes'],
      tradeType = TradeType.SWAP,
    ): TradeFormValidationContext {
      return {
        ...baseContext,
        derivedTradeState: { ...baseContext.derivedTradeState, tradeType },
        tradeQuote: { isLoading: false, quote: {}, fetchParams: { priceQuality: 'verified' }, pendingQuotes },
      } as unknown as TradeFormValidationContext
    }

    const FAST_PENDING = { fetchStartTimestamp: 1, priceQualities: [PriceQuality.FAST] }

    test('adds QuoteLoading until every quote of the fetch round has arrived', () => {
      expect(validateTradeForm(withPendingQuotes(FAST_PENDING))).toContain(TradeFormValidation.QuoteLoading)
    })

    test('does not add QuoteLoading once every quote has arrived', () => {
      expect(validateTradeForm(withPendingQuotes(null)) || []).not.toContain(TradeFormValidation.QuoteLoading)
    })

    test('does not add QuoteLoading for a limit order while its quote refreshes', () => {
      expect(validateTradeForm(withPendingQuotes(FAST_PENDING, TradeType.LIMIT_ORDER)) || []).not.toContain(
        TradeFormValidation.QuoteLoading,
      )
    })
  })
})

describe('validateTradeForm - native sell in limit orders', () => {
  const SOLANA_USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

  const baseContext: Partial<TradeFormValidationContext> = {
    derivedTradeState: {
      orderKind: OrderKind.SELL,
      inputCurrencyAmount: mockCurrencyAmount('100'),
      outputCurrencyAmount: mockCurrencyAmount('100'),
      inputCurrency: NATIVE_CURRENCIES[SupportedChainId.SOLANA] as unknown as Currency,
      outputCurrency: { address: SOLANA_USDC, chainId: SupportedChainId.SOLANA } as unknown as Currency,
      inputCurrencyBalance: mockCurrencyAmount('1000'),
      outputCurrencyBalance: mockCurrencyAmount('1000'),
      inputCurrencyFiatAmount: mockCurrencyAmount('1'),
      outputCurrencyFiatAmount: null,
      recipient: null,
      isQuoteBasedOrder: true,
      tradeType: TradeType.LIMIT_ORDER,
      slippage: null,
    },
    tradeQuote: { isLoading: false, quote: {} } as unknown as TradeQuoteState,
    isOnline: true,
    isSupportedWallet: true,
    account: 'BYXaGFW8VavtBLu56a53wuUZyRqp9b8ibRR2dojVTWv7',
    isApproveRequired: ApproveRequiredReason.Unsupported,
    isWrapUnwrap: false,
    isSafeReadonlyUser: false,
    isSwapUnsupported: false,
    recipientEnsAddress: null,
    isInsufficientBalanceOrderAllowed: true,
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
    solanaNativeShortfall: null,
  }

  test('blocks a native SOL limit order with SellNativeToken as the primary validation', () => {
    const result = validateTradeForm(baseContext as TradeFormValidationContext)

    expect(result?.[0]).toBe(TradeFormValidation.SellNativeToken)
  })

  test('keeps SellNativeToken as the primary validation above the Solana Alpha trade cap', () => {
    const result = validateTradeForm({
      ...baseContext,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrencyFiatAmount: mockCurrencyAmount('20000'),
      },
    } as unknown as TradeFormValidationContext)

    expect(result?.[0]).toBe(TradeFormValidation.SellNativeToken)
  })

  test('keeps the Solana Alpha trade cap for an SPL limit order', () => {
    const result = validateTradeForm({
      ...baseContext,
      isApproveRequired: ApproveRequiredReason.BundleApproveRequired,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrency: { address: SOLANA_USDC, chainId: SupportedChainId.SOLANA } as unknown as Currency,
        inputCurrencyFiatAmount: mockCurrencyAmount('20000'),
      },
    } as unknown as TradeFormValidationContext)

    expect(result).toEqual([TradeFormValidation.SolanaAlphaMaxTradeSize])
  })

  test('does not block an SPL limit order', () => {
    const result = validateTradeForm({
      ...baseContext,
      isApproveRequired: ApproveRequiredReason.BundleApproveRequired,
      derivedTradeState: {
        ...baseContext.derivedTradeState,
        inputCurrency: { address: SOLANA_USDC, chainId: SupportedChainId.SOLANA } as unknown as Currency,
      },
    } as unknown as TradeFormValidationContext)

    expect(result || []).not.toContain(TradeFormValidation.SellNativeToken)
  })
})
