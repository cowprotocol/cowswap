import { CanonicalMarketParams, getCanonicalMarket } from '@src/custom/utils/misc'
import { CurrencyAmount, TradeType, Price, Percent, Fraction, Trade } from '@uniswap/sdk'
import { FeeInformation, PriceInformation } from '../price/reducer'

export type FeeForTrade = { feeAsCurrency: CurrencyAmount } & Pick<FeeInformation, 'amount'>

export type TradeWithFee = Omit<Trade, 'nextMidPrice' | 'exactIn' | 'exactOut'> & {
  inputAmountWithFee: CurrencyAmount
  outputAmountWithoutFee?: CurrencyAmount
  fee: FeeForTrade
}

type TradeExecutionPrice = CanonicalMarketParams<CurrencyAmount | undefined> & { price?: PriceInformation }

export function _constructTradePrice({ sellToken, buyToken, kind, price }: TradeExecutionPrice): Price | undefined {
  if (!sellToken || !buyToken || !price?.amount) return

  let executionPrice: Price | undefined
  // get canonical market tokens
  // to accurately create our Price
  const { baseToken, quoteToken } = getCanonicalMarket({
    sellToken,
    buyToken,
    kind
  })

  if (baseToken && quoteToken && price) {
    executionPrice = new Price(baseToken.currency, quoteToken.currency, baseToken.raw.toString(), price.amount)
  }
  return executionPrice
}

export function _minimumAmountOut(pct: Percent, trade: TradeGp) {
  if (trade.tradeType === TradeType.EXACT_OUTPUT) {
    return trade.outputAmount
  }

  const priceDisplayed = trade.executionPrice.invert().raw
  const slippage = new Fraction('1').add(pct)
  // slippage is applied to PRICE
  const slippagePrice = priceDisplayed.multiply(slippage)
  // newly constructed price with slippage applied
  const minPrice = new Price(
    trade.executionPrice.quoteCurrency,
    trade.executionPrice.baseCurrency,
    slippagePrice.denominator,
    slippagePrice.numerator
  )

  const minimumAmountOut = minPrice.invert().quote(trade.inputAmountWithFee)

  return minimumAmountOut
}

export function _maximumAmountIn(pct: Percent, trade: TradeGp) {
  if (trade.tradeType === TradeType.EXACT_INPUT) {
    return trade.inputAmount
  }
  const priceDisplayed = trade.executionPrice.invert().raw
  const slippage = new Fraction('1').subtract(pct)
  // slippage is applied to the price
  const slippagePrice = priceDisplayed.multiply(slippage)
  // construct new price using slippage price
  const maxPrice = new Price(
    trade.executionPrice.quoteCurrency,
    trade.executionPrice.baseCurrency,
    slippagePrice.denominator,
    slippagePrice.numerator
  )

  // fee is in sell token so we
  // add fee to the calculated input
  const maximumAmountIn = maxPrice
    .invert()
    .quote(trade.outputAmount)
    .add(trade.fee.feeAsCurrency)

  return maximumAmountIn
}

interface TradeGpConstructor {
  inputAmount: CurrencyAmount
  inputAmountWithFee: CurrencyAmount
  outputAmount: CurrencyAmount
  outputAmountWithoutFee: CurrencyAmount
  fee: FeeForTrade
  executionPrice: Price
  tradeType: TradeType
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
  readonly inputAmount: CurrencyAmount
  readonly inputAmountWithFee: CurrencyAmount
  /**
   * The output amount for the trade assuming no slippage.
   */
  readonly outputAmount: CurrencyAmount
  readonly outputAmountWithoutFee?: CurrencyAmount
  /**
   * Trade fee
   */
  readonly fee: FeeForTrade
  /**
   * The price expressed in terms of output amount/input amount.
   */
  readonly executionPrice: Price

  public constructor({
    inputAmount,
    inputAmountWithFee,
    outputAmount,
    outputAmountWithoutFee,
    fee,
    executionPrice,
    tradeType
  }: TradeGpConstructor) {
    this.tradeType = tradeType
    this.inputAmount = inputAmount
    this.inputAmountWithFee = inputAmountWithFee
    this.outputAmountWithoutFee = outputAmountWithoutFee
    this.outputAmount = outputAmount
    this.fee = fee
    this.executionPrice = executionPrice
  }
  /**
   * Get the minimum amount that must be received from this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */
  public minimumAmountOut(slippageTolerance: Percent): CurrencyAmount {
    return _minimumAmountOut(slippageTolerance, this)
  }
  /**
   * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */
  public maximumAmountIn(slippageTolerance: Percent): CurrencyAmount {
    return _maximumAmountIn(slippageTolerance, this)
  }
}
