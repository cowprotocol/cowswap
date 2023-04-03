import { CanonicalMarketParams, getCanonicalMarket } from 'utils/misc'
import { CurrencyAmount, Currency, TradeType, Price, Percent } from '@uniswap/sdk-core'
import { Trade } from '@uniswap/v2-sdk'
import { FeeInformation, PriceInformation } from '@cow/types'
import { ONE_FRACTION } from 'constants/misc'

export type FeeForTrade = { feeAsCurrency: CurrencyAmount<Currency> } & Pick<FeeInformation, 'amount'>

export type TradeWithFee = Omit<Trade<Currency, Currency, TradeType>, 'nextMidPrice' | 'exactIn' | 'exactOut'> & {
  inputAmountWithFee: CurrencyAmount<Currency>
  outputAmountWithoutFee?: CurrencyAmount<Currency>
  fee: FeeForTrade
}

type TradeExecutionPrice = CanonicalMarketParams<CurrencyAmount<Currency> | undefined> & { price?: PriceInformation }

export function _constructTradePrice({
  sellToken,
  buyToken,
  kind,
  price,
}: TradeExecutionPrice): Price<Currency, Currency> | undefined {
  if (!sellToken || !buyToken || !price?.amount) return

  let executionPrice: Price<Currency, Currency> | undefined
  // get canonical market tokens
  // to accurately create our Price<Currency, Currency>
  const { baseToken, quoteToken } = getCanonicalMarket({
    sellToken,
    buyToken,
    kind,
  })

  if (baseToken && quoteToken && price) {
    executionPrice = new Price<Currency, Currency>(
      // baseToken.currency,
      // quoteToken.currency,
      // baseToken.currency.quotient,
      // price.amount
      // TODO: CHECK THIS IS THE SAME AS THE ABOVE ON THE OLDER SDK
      { baseAmount: baseToken, quoteAmount: CurrencyAmount.fromRawAmount(quoteToken.currency, price.amount) }
    )
  }
  return executionPrice
}

export function _minimumAmountOut(pct: Percent, trade: TradeGp) {
  if (trade.tradeType === TradeType.EXACT_OUTPUT) {
    return trade.outputAmount
  }

  return trade.outputAmount.multiply(ONE_FRACTION.subtract(pct))
}

export function _maximumAmountIn(pct: Percent, trade: TradeGp) {
  if (trade.tradeType === TradeType.EXACT_INPUT) {
    return trade.inputAmount
  }

  return trade.inputAmountWithFee.multiply(ONE_FRACTION.add(pct))
}

interface TradeGpConstructor {
  inputAmount: CurrencyAmount<Currency>
  inputAmountWithFee: CurrencyAmount<Currency>
  inputAmountWithoutFee: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  outputAmountWithoutFee: CurrencyAmount<Currency>
  fee: FeeForTrade
  executionPrice: Price<Currency, Currency>
  tradeType: TradeType
  quoteId?: number
}

/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export default class TradeGp {
  /**
   * The type of the trade, either exact in or exact out.
   */
  readonly tradeType: TradeType
  /**
   * The input amount for the trade assuming no slippage.
   */
  readonly inputAmount: CurrencyAmount<Currency>
  readonly inputAmountWithFee: CurrencyAmount<Currency>
  readonly inputAmountWithoutFee: CurrencyAmount<Currency>
  /**
   * The output amount for the trade assuming no slippage.
   */
  readonly outputAmount: CurrencyAmount<Currency>
  readonly outputAmountWithoutFee?: CurrencyAmount<Currency>
  /**
   * Trade fee
   */
  readonly fee: FeeForTrade
  /**
   * The price expressed in terms of output amount/input amount.
   */
  readonly executionPrice: Price<Currency, Currency>

  /**
   * The id returned by CoW Swap's quote backend, if any
   *
   * Note that it won't be set for fast quotes, nor for quotes from other sources (paraswap, 0x, etc)
   */
  readonly quoteId?: number

  public constructor({
    inputAmount,
    inputAmountWithFee,
    inputAmountWithoutFee,
    outputAmount,
    outputAmountWithoutFee,
    fee,
    executionPrice,
    tradeType,
    quoteId,
  }: TradeGpConstructor) {
    this.tradeType = tradeType
    this.inputAmount = inputAmount
    this.inputAmountWithFee = inputAmountWithFee
    this.inputAmountWithoutFee = inputAmountWithoutFee
    this.outputAmountWithoutFee = outputAmountWithoutFee
    this.outputAmount = outputAmount
    this.fee = fee
    this.executionPrice = executionPrice
    this.quoteId = quoteId
  }
  /**
   * Get the minimum amount that must be received from this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */
  public minimumAmountOut(slippageTolerance: Percent): CurrencyAmount<Currency> {
    return _minimumAmountOut(slippageTolerance, this)
  }
  /**
   * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */
  public maximumAmountIn(slippageTolerance: Percent): CurrencyAmount<Currency> {
    return _maximumAmountIn(slippageTolerance, this)
  }
}
