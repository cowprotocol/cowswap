import { NATIVE_CURRENCIES, USDC_ARBITRUM_ONE, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { createChartAssets, getChartAssetKey } from './chartAssets.utils'

const CHAIN = SupportedChainId.ARBITRUM_ONE

describe('chartAssets', () => {
  it('uses wrapped native addresses while keeping native display symbols', () => {
    const assets = createChartAssets(NATIVE_CURRENCIES[CHAIN], USDC_ARBITRUM_ONE)

    expect(assets[0]).toEqual({
      address: getAddressKey(WRAPPED_NATIVE_CURRENCIES[CHAIN].address),
      chainId: CHAIN,
      symbol: 'ETH',
    })
    expect(assets).toHaveLength(2)
  })

  it('keeps different token addresses with the same display symbol', () => {
    const token = new Token(CHAIN, '0x0000000000000000000000000000000000000001', 6, 'USDC')
    const assets = createChartAssets(token, USDC_ARBITRUM_ONE)

    expect(assets).toHaveLength(2)
    expect(getChartAssetKey(assets[0])).not.toEqual(getChartAssetKey(assets[1]))
  })

  it('deduplicates native and wrapped versions of the same asset', () => {
    expect(createChartAssets(NATIVE_CURRENCIES[CHAIN], WRAPPED_NATIVE_CURRENCIES[CHAIN])).toHaveLength(1)
  })

  it('keeps the same token address on different chains distinct', () => {
    const token = new Token(SupportedChainId.MAINNET, USDC_ARBITRUM_ONE.address, 6, 'USDC')
    const assets = createChartAssets(token, USDC_ARBITRUM_ONE)

    expect(assets).toHaveLength(2)
    expect(getChartAssetKey(assets[0])).not.toEqual(getChartAssetKey(assets[1]))
  })
})
