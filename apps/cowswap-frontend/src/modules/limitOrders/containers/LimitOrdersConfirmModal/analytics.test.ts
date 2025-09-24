import { OrderKind } from '@cowprotocol/cow-sdk'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'

import { buildPlaceLimitOrderEvent, buildLimitOrderEventLabel, ExecutionPriceLike } from './analytics'

const tokenSell = new Token(1, '0x0000000000000000000000000000000000000001', 18, 'TK1', 'Token 1')
const tokenBuy = new Token(1, '0x0000000000000000000000000000000000000002', 6, 'TK2', 'Token 2')

const inputAmount = CurrencyAmount.fromRawAmount(tokenSell, '1000000000000000000') // 1 TK1
const outputAmount = CurrencyAmount.fromRawAmount(tokenBuy, '2500000') // 2.5 TK2
const executionPrice: ExecutionPriceLike = {
  toSignificant: () => '2.5',
}

describe('limit order analytics', () => {
  it('builds descriptive label', () => {
    const label = buildLimitOrderEventLabel({
      inputToken: tokenSell,
      outputToken: tokenBuy,
      kind: OrderKind.SELL,
      executionPrice,
      inputAmount,
      partialFillsEnabled: true,
    })

    expect(label).toContain('TokenIn: TK1')
    expect(label).toContain('TokenOut: TK2')
    expect(label).toContain('Side: sell')
    expect(label).toContain('PartialFills: true')
  })

  it('builds place_limit_order event payload', () => {
    const event = buildPlaceLimitOrderEvent({
      inputAmount,
      outputAmount,
      kind: OrderKind.SELL,
      executionPrice,
      partialFillsEnabled: false,
      walletAddress: '0xabc',
      chainId: 1,
    })

    const parsed = JSON.parse(event) as Record<string, unknown>

    expect(parsed.event).toBe('place_limit_order')
    expect(parsed.event_category).toBe('Limit Order Settings')
    expect(parsed.sellToken).toBe(tokenSell.address)
    expect(parsed.buyToken).toBe(tokenBuy.address)
    expect(parsed.sellAmount).toBe('1')
    expect(parsed.buyAmountExpected).toBe('2.5')
    expect(parsed.sellTokenSymbol).toBe('TK1')
    expect(parsed.buyTokenSymbol).toBe('TK2')
    expect(parsed.chain_id).toBe(1)
    expect(parsed.walletAddress).toBe('0xabc')
    expect(parsed.orderKind).toBe(OrderKind.SELL)
    expect(parsed.side).toBe('sell')
  })
})
