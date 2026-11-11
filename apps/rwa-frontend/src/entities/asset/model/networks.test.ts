/**
 * @jest-environment node
 */

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getTradeAsset } from './networks'
import { getAssetByTicker } from './registry'

import type { RwaAsset, RwaToken } from './types'

const MAINNET_TOKEN: RwaToken = {
  chainId: SupportedChainId.MAINNET,
  address: '0x9d275685dC284C8eB1C79f6ABA7a63Dc75ec890a',
  symbol: 'AAPLx',
  name: 'Apple xStock',
  decimals: 18,
  issuer: 'xStocks',
}
const ROBINHOOD_TOKEN: RwaToken = { ...MAINNET_TOKEN, chainId: SupportedChainId.ROBINHOOD }
const SEPOLIA_TOKEN: RwaToken = { ...MAINNET_TOKEN, chainId: SupportedChainId.SEPOLIA }

describe('getTradeAsset', () => {
  it('keeps only the tokens on RWA networks', () => {
    const asset = { ticker: 'AAPL', tokens: [ROBINHOOD_TOKEN, MAINNET_TOKEN, SEPOLIA_TOKEN] } as RwaAsset

    expect(getTradeAsset(asset).tokens).toEqual([MAINNET_TOKEN])
  })

  it('leaves the registry asset of a Robinhood-only ticker without trade tokens', () => {
    const asset = getAssetByTicker('RUN')

    expect(asset?.tokens.length).toBeGreaterThan(0)
    expect(asset && getTradeAsset(asset).tokens).toEqual([])
  })
})
