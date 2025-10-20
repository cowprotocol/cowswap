import { TokenWithLogo } from '@cowprotocol/common-const'
import type { CrossChainOrder } from '@cowprotocol/sdk-bridging'
import type { TokensByAddress } from '@cowprotocol/tokens'

import { buildBridgeSuccessAliasFields } from './PendingBridgeOrdersUpdater'

const buildToken = (params: { chainId: number; address: string; symbol: string; decimals: number }): TokenWithLogo => {
  const { chainId, address, symbol, decimals } = params

  return TokenWithLogo.fromToken({
    chainId,
    address,
    decimals,
    symbol,
    name: symbol,
  })
}

describe('buildBridgeSuccessAliasFields', () => {
  const inputTokenAddress = '0x1111111111111111111111111111111111111111'
  const outputTokenAddress = '0x2222222222222222222222222222222222222222'

  const baseCrossChainOrder = {
    bridgingParams: {
      inputTokenAddress,
      outputTokenAddress,
      inputAmount: '1000000000000000000', // 1.0 with 18 decimals
      outputAmount: '2000000', // 2.0 with 6 decimals
    },
  } as unknown as CrossChainOrder

  it('formats alias fields when token metadata is available', () => {
    const tokensByAddress: TokensByAddress = {
      [inputTokenAddress.toLowerCase()]: buildToken({
        chainId: 1,
        address: inputTokenAddress,
        symbol: 'FROM',
        decimals: 18,
      }),
      [outputTokenAddress.toLowerCase()]: buildToken({
        chainId: 100,
        address: outputTokenAddress,
        symbol: 'TO',
        decimals: 6,
      }),
    }

    const result = buildBridgeSuccessAliasFields(baseCrossChainOrder, tokensByAddress)

    expect(result).toEqual({
      from_currency_address: inputTokenAddress,
      to_currency_address: outputTokenAddress,
      from_currency: 'FROM',
      to_currency: 'TO',
      from_amount: '1',
      to_amount: '2',
    })
  })

  it('falls back to empty strings when token metadata is missing', () => {
    const tokensByAddress: TokensByAddress = {}

    const result = buildBridgeSuccessAliasFields(baseCrossChainOrder, tokensByAddress)

    expect(result).toEqual({
      from_currency_address: inputTokenAddress,
      to_currency_address: outputTokenAddress,
      from_currency: '',
      to_currency: '',
      from_amount: undefined,
      to_amount: undefined,
    })
  })
})
