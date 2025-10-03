import { Token, CurrencyAmount } from '@uniswap/sdk-core'

import { buildSwapBridgeClickEvent } from './analytics'

function parse(event: string | undefined): Record<string, unknown> {
  if (!event) throw new Error('Expected event string')
  return JSON.parse(event) as Record<string, unknown>
}

describe('swap trade button analytics', () => {
  const tokenIn = new Token(1, '0x0000000000000000000000000000000000000001', 18, 'TK1', 'Token 1')
  const tokenOut = new Token(100, '0x0000000000000000000000000000000000000002', 6, 'BRG', 'Bridge Token')

  const inputAmount = CurrencyAmount.fromRawAmount(tokenIn, '500000000000000000') // 0.5 TK1
  const outputAmount = CurrencyAmount.fromRawAmount(tokenOut, '7500000') // 7.5 BRG

  it('builds swap_bridge_click event when trade is bridging', () => {
    const event = buildSwapBridgeClickEvent({
      isCurrentTradeBridging: true,
      inputCurrency: tokenIn,
      outputCurrency: tokenOut,
      inputCurrencyAmount: inputAmount,
      outputCurrencyAmount: outputAmount,
      chainId: 1,
      walletAddress: '0xabc',
    })

    const parsed = parse(event)

    expect(parsed).toEqual(
      expect.objectContaining({
        event: 'swap_bridge_click',
        event_category: 'Bridge',
        fromChainId: 1,
        toChainId: 100,
        sellToken: tokenIn.address,
        buyToken: tokenOut.address,
        sellAmount: inputAmount.quotient.toString(),
        buyAmountExpected: outputAmount.quotient.toString(),
      }),
    )
  })

  it('returns undefined when trade is not bridging', () => {
    const event = buildSwapBridgeClickEvent({
      isCurrentTradeBridging: false,
      inputCurrency: tokenIn,
      outputCurrency: tokenOut,
      inputCurrencyAmount: inputAmount,
      outputCurrencyAmount: outputAmount,
      chainId: 1,
      walletAddress: '0xabc',
    })

    expect(event).toBeUndefined()
  })
})
