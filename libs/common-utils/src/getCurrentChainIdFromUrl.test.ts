import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getCurrentChainIdFromUrl } from './getCurrentChainIdFromUrl'

describe('getCurrentChainIdFromUrl()', () => {
  it('When chainId presents in the url path, then it should taken as chainId', () => {
    const chainId = getCurrentChainIdFromUrl({
      hash: '#/11155111/WETH',
    } as Location)

    expect(chainId).toBe(SupportedChainId.SEPOLIA)
  })

  it('When chainId from the url path is not valid, then should take mainnet as default', () => {
    const chainId = getCurrentChainIdFromUrl({
      hash: '#/999/WETH',
    } as Location)

    expect(chainId).toBe(SupportedChainId.MAINNET)
  })

  it('When network name presents in the url query, then it should taken as chainId', () => {
    const chainId = getCurrentChainIdFromUrl({
      hash: '#/WETH?chain=gnosis_chain',
    } as Location)

    expect(chainId).toBe(SupportedChainId.GNOSIS_CHAIN)
  })

  it('When network name from the url query is not valid, then should take mainnet as default', () => {
    const chainId = getCurrentChainIdFromUrl({
      hash: '#/WETH?chain=blabla',
    } as Location)

    expect(chainId).toBe(SupportedChainId.MAINNET)
  })
})
