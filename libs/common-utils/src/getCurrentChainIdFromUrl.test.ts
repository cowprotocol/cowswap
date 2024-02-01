import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getCurrentChainIdFromUrl } from './getCurrentChainIdFromUrl'

describe('getCurrentChainIdFromUrl()', () => {
  it('When chainId presents in the url path, then it should taken as chainId', () => {
    Object.defineProperty(window, 'location', {
      value: {
        hash: '#/11155111/WETH',
      },
      writable: true,
    })
    const chainId = getCurrentChainIdFromUrl()

    expect(chainId).toBe(SupportedChainId.SEPOLIA)
  })

  it('When chainId from the url path is not valid, then should take mainnet as default', () => {
    Object.defineProperty(window, 'location', {
      value: {
        hash: '#/999/WETH',
      },
      writable: true,
    })

    const chainId = getCurrentChainIdFromUrl()

    expect(chainId).toBe(SupportedChainId.MAINNET)
  })

  it('When network name presents in the url query, then it should taken as chainId', () => {
    Object.defineProperty(window, 'location', {
      value: {
        hash: '#/WETH?chain=gnosis_chain',
      },
      writable: true,
    })

    const chainId = getCurrentChainIdFromUrl()

    expect(chainId).toBe(SupportedChainId.GNOSIS_CHAIN)
  })

  it('When network name from the url query is not valid, then should take mainnet as default', () => {
    Object.defineProperty(window, 'location', {
      value: {
        hash: '#/WETH?chain=blabla',
      },
      writable: true,
    })

    const chainId = getCurrentChainIdFromUrl()

    expect(chainId).toBe(SupportedChainId.MAINNET)
  })
})
