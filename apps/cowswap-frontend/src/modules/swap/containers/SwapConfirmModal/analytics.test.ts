import { Token, CurrencyAmount } from '@uniswap/sdk-core'

import { buildSwapConfirmEvent } from './analytics'

function parseEvent(event: string | undefined): Record<string, unknown> {
  if (!event) throw new Error('Expected event string')
  return JSON.parse(event) as Record<string, unknown>
}

describe('swap confirm analytics', () => {
  const tokenIn = new Token(1, '0x0000000000000000000000000000000000000001', 18, 'TK1', 'Token 1')
  const tokenOutSameChain = new Token(1, '0x0000000000000000000000000000000000000002', 6, 'TK2', 'Token 2')
  const tokenOutBridge = new Token(100, '0x0000000000000000000000000000000000000003', 6, 'BRG', 'Bridge Token')

  const amountIn = CurrencyAmount.fromRawAmount(tokenIn, '1000000000000000000') // 1 TK1
  const amountOutSameChain = CurrencyAmount.fromRawAmount(tokenOutSameChain, '2000000') // 2 TK2
  const amountOutBridge = CurrencyAmount.fromRawAmount(tokenOutBridge, '3000000') // 3 BRG

  it('builds same-chain swap confirm event payload', () => {
    const event = buildSwapConfirmEvent({
      chainId: 1,
      inputAmount: amountIn,
      outputAmount: amountOutSameChain,
      account: '0xabc',
      ensName: 'alice.eth',
    })

    const parsed = parseEvent(event)

    expect(parsed).toEqual(
      expect.objectContaining({
        event: 'swap_confirm_click',
        event_category: 'Trade',
        fromChainId: 1,
        sellToken: tokenIn.address,
        buyToken: tokenOutSameChain.address,
        sellAmount: '1',
        buyAmountExpected: '2',
        buyTokenChainId: 1,
        walletAddress: '0xabc',
        walletAddressAlias: 'alice.eth',
      }),
    )
  })

  it('builds bridge swap confirm event payload', () => {
    const event = buildSwapConfirmEvent({
      chainId: 1,
      inputAmount: amountIn,
      outputAmount: amountOutBridge,
      account: '0xabc',
      ensName: undefined,
    })

    const parsed = parseEvent(event)

    expect(parsed).toEqual(
      expect.objectContaining({
        event: 'swap_bridge_confirm_click',
        event_category: 'Bridge',
        fromChainId: 1,
        toChainId: 100,
        sellToken: tokenIn.address,
        buyToken: tokenOutBridge.address,
        sellAmount: '1',
        buyAmountExpected: '3',
      }),
    )
  })

  it('returns undefined when input amount missing', () => {
    const event = buildSwapConfirmEvent({
      chainId: 1,
      inputAmount: null,
      outputAmount: amountOutSameChain,
      account: undefined,
      ensName: undefined,
    })

    expect(event).toBeUndefined()
  })
})
