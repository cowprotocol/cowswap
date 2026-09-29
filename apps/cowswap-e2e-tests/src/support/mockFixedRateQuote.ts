import type { CowProtocolApiMock } from '../mocks/cowProtocolApi'

export interface MockFixedRateQuoteOpts {
  cowApi: CowProtocolApiMock
  /**
   * The rate applied to compute the amount on the other side of the trade. Omit it to leave both
   * `sellAmount`/`buyAmount` as the fixture provides them and only zero out the fee — enough for
   * tests that don't care about the exact rate, just that the fee doesn't skew a balance
   * assertion.
   */
  rate?: { numerator: bigint; denominator: bigint }
  /**
   * Which side of the trade is "fixed" (the amount the user actually typed) and therefore which
   * gets computed from `rate`: `'sell'` computes `buyAmount` from `sellAmount` (a sell order),
   * `'buy'` computes `sellAmount` from `buyAmount` (a buy order). Defaults to `'sell'`.
   */
  direction?: 'sell' | 'buy'
}

/**
 * Zeroes out `protocolFeeBps`/`feeAmount` on every `/api/v1/quote` response and, when a `rate` is
 * given, pins the non-fixed side of the trade to that rate — the combination this suite's tests
 * repeatedly need to keep a post-trade balance assertion a round number instead of one skewed by
 * an arbitrary fixture fee.
 */
export function mockFixedRateQuote(opts: MockFixedRateQuoteOpts): void {
  const { cowApi, rate, direction = 'sell' } = opts

  cowApi.set('quote', (req) => {
    const defaults = req.defaults as { quote: Record<string, unknown> }

    const computedAmount = !rate
      ? {}
      : direction === 'sell'
        ? { buyAmount: ((BigInt(defaults.quote.sellAmount as string) * rate.numerator) / rate.denominator).toString() }
        : { sellAmount: ((BigInt(defaults.quote.buyAmount as string) * rate.numerator) / rate.denominator).toString() }

    return {
      ...defaults,
      protocolFeeBps: '0',
      quote: { ...defaults.quote, ...computedAmount, feeAmount: '0' },
    }
  })
}
