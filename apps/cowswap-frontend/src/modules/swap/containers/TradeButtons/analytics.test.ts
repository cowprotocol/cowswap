import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { buildSwapBridgeClickEvent } from '../../hooks/useSwapBridgeClickEvent'

describe('buildSwapBridgeClickEvent', () => {
  const sellToken = new Token(
    SupportedChainId.ARBITRUM_ONE,
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    18,
    'DAI',
    'DAI Stablecoin',
  )
  const buyToken = new Token(
    SupportedChainId.MAINNET,
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    8,
    'WBTC',
    'Wrapped Bitcoin',
  )

  const sellAmount = CurrencyAmount.fromRawAmount(sellToken, '8920750000000000000')
  const buyAmount = CurrencyAmount.fromRawAmount(buyToken, '10049')

  it('builds swap_bridge_click payload with normalized fields', () => {
    const event = buildSwapBridgeClickEvent({
      action: 'swap_bridge_click',
      isBridging: true,
      account: '0xca011d01a4b75a36afb5e2b69e0ba8f01c6b500e',
      sellAmount,
      buyAmount,
    })

    expect(event).toBeDefined()

    const parsed = JSON.parse(event as string) as Record<string, unknown>

    expect(parsed).toMatchObject({
      event: 'swap_bridge_click',
      event_category: 'Bridge',
      walletAddress: '0xca011d01a4b75a36afb5e2b69e0ba8f01c6b500e',
      fromChainId: SupportedChainId.ARBITRUM_ONE,
      toChainId: SupportedChainId.MAINNET,
      sellToken: sellToken.address,
      sellTokenSymbol: 'dai',
      sellTokenDecimals: 18,
      sellTokenChainId: SupportedChainId.ARBITRUM_ONE,
      sellAmount: '8920750000000000000',
      sellAmountHuman: '8.92075',
      buyToken: buyToken.address,
      buyTokenSymbol: 'wbtc',
      buyTokenDecimals: 8,
      buyTokenChainId: SupportedChainId.MAINNET,
      buyAmountExpected: '10049',
      buyAmountHuman: '0.00010049',
    })

    expect(parsed.event_label).toContain('from: 42161')
    expect(parsed.event_label).toContain('to: 1')
    expect(parsed.event_label).toContain('tokenin: dai')
    expect(parsed.event_label).toContain('tokenout: wbtc')
    expect(parsed.event_label).toContain('amount: 8.92075')
    expect(parsed.event_value).toBeCloseTo(8.92075, 8)
  })

  it('returns undefined when not bridging', () => {
    expect(
      buildSwapBridgeClickEvent({
        action: 'swap_bridge_click',
        isBridging: false,
        account: '0xca011d01a4b75a36afb5e2b69e0ba8f01c6b500e',
        sellAmount,
        buyAmount,
      }),
    ).toBeUndefined()
  })

  it('returns undefined when amounts are missing', () => {
    expect(
      buildSwapBridgeClickEvent({
        action: 'swap_bridge_click',
        isBridging: true,
        account: '0xca011d01a4b75a36afb5e2b69e0ba8f01c6b500e',
        sellAmount: null,
        buyAmount,
      }),
    ).toBeUndefined()
  })
})
