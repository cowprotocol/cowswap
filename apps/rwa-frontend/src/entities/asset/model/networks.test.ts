/**
 * @jest-environment node
 */

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { isListedAsset, RWA_CHAIN_IDS } from './networks'
import { getAllAssets, getAllAssetSummaries, getAssetByTicker, getAssets, getAssetSummaries } from './registry'

const chainIdsOf = (assets: { tokens: { chainId: number }[] }[]): number[] =>
  [...new Set(assets.flatMap((asset) => asset.tokens.map((token) => token.chainId)))].sort()

describe('isListedAsset', () => {
  it.each([
    { chainIds: [SupportedChainId.ROBINHOOD, SupportedChainId.MAINNET], expected: true },
    { chainIds: [SupportedChainId.ROBINHOOD], expected: false },
    { chainIds: [SupportedChainId.SEPOLIA], expected: false },
  ])('is $expected for tokens on $chainIds', ({ chainIds, expected }) => {
    expect(isListedAsset({ tokens: chainIds.map((chainId) => ({ chainId })) })).toBe(expected)
  })
})

describe('registry views', () => {
  it('lists tokens on every RWA network, and on no other', () => {
    expect(chainIdsOf(getAssets())).toEqual([...RWA_CHAIN_IDS].sort())
    expect(chainIdsOf(getAssetSummaries())).toEqual([...RWA_CHAIN_IDS].sort())
  })

  it('leaves out an asset with tokens only on other networks, but keeps it for holdings', () => {
    expect(getAssetByTicker('RUN')).toBeUndefined()
    expect(getAllAssets().find((asset) => asset.ticker === 'RUN')?.tokens.length).toBeGreaterThan(0)
    expect(getAllAssetSummaries().some((asset) => asset.ticker === 'RUN')).toBe(true)
  })

  it('keeps the tokens on other networks for holdings', () => {
    expect(chainIdsOf(getAllAssets())).toContain(SupportedChainId.ROBINHOOD)
  })
})
