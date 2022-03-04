import { SupportedChainId } from 'constants/chains'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import TradeGp from './TradeGp'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'

export function isWrappingTrade(
  sellCurrency: Currency | null | undefined,
  buyCurrency: Currency | null | undefined,
  chainId?: SupportedChainId
): boolean {
  const wethByChain = WRAPPED_NATIVE_CURRENCY[chainId || SupportedChainId.MAINNET]
  return Boolean(
    (sellCurrency?.isNative && buyCurrency?.wrapped.equals(wethByChain)) ||
      (buyCurrency?.isNative && sellCurrency?.wrapped.equals(wethByChain))
  )
}

export function logTradeDetails(trade: TradeGp | undefined, allowedSlippage: Percent) {
  // don't do anything outside of dev env
  if (!trade || process.env.NODE_ENV !== 'development') return

  const exactIn = trade.tradeType === TradeType.EXACT_INPUT

  // Log Exact In Trade info
  if (exactIn) {
    console.debug(
      `[SwapMod::[SELL] Trade Constructed]`,
      `
      Type: SELL
      ==========
      Input Amount:         ${trade.inputAmount.toExact()}
      Output Amount:        ${trade.outputAmount.toExact()}
      ==========
      Fee Amount [as SELL]: ${trade.fee?.feeAsCurrency?.toExact()} ${trade.inputAmount.currency.symbol}
      Fee Amount [as BUY]:  ${
        trade.outputAmountWithoutFee && trade.outputAmountWithoutFee.subtract(trade.outputAmount).toExact()
      } ${trade.outputAmount.currency.symbol}
      ==========
      Minimum Received:     ${trade.minimumAmountOut(allowedSlippage).toExact()}
    `
    )
  } else {
    // Log Exact Out Trade info
    console.debug(
      `[SwapMod::[BUY] Trade Constructed]`,
      `
      Type: BUY
      =========
      Input Amount [w/FEE]: ${trade.inputAmountWithFee.toExact()}
      Output Amount:        ${trade.outputAmount.toExact()}
      =========
      Fee Amount [as SELL]: ${trade.fee?.feeAsCurrency?.toExact()} ${trade.inputAmount.currency.symbol}
      =========
      Maximum Sold:         ${trade.fee?.feeAsCurrency && trade.maximumAmountIn(allowedSlippage).toExact()}
    `
    )
  }
}
