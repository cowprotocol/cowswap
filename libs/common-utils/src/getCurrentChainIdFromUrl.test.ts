import { SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  getCurrentChainIdFromUrl,
  getRawCurrentChainIdFromUrl,
  parseChainIdFromUrlSegment,
} from './getCurrentChainIdFromUrl'

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

describe('getRawCurrentChainIdFromUrl()', () => {
  it('resolves numeric chainId at end of hash (#/42161)', () => {
    expect(getRawCurrentChainIdFromUrl({ hash: '#/42161' } as Location)).toBe(SupportedChainId.ARBITRUM_ONE)
  })

  it('resolves chain name in path (#/arbitrum/swap) by ID', () => {
    expect(getRawCurrentChainIdFromUrl({ hash: '#/arbitrum/swap' } as Location)).toBe(SupportedChainId.ARBITRUM_ONE)
  })

  it('resolves arbitrum-one slug in path', () => {
    expect(getRawCurrentChainIdFromUrl({ hash: '#/arbitrum-one/swap' } as Location)).toBe(SupportedChainId.ARBITRUM_ONE)
  })

  it('resolves sepolia name in path', () => {
    expect(getRawCurrentChainIdFromUrl({ hash: '#/sepolia/swap' } as Location)).toBe(SupportedChainId.SEPOLIA)
  })
})

describe('parseChainIdFromUrlSegment()', () => {
  it('resolves numeric string to chain ID', () => {
    expect(parseChainIdFromUrlSegment('42161')).toBe(SupportedChainId.ARBITRUM_ONE)
    expect(parseChainIdFromUrlSegment('11155111')).toBe(SupportedChainId.SEPOLIA)
  })

  it('resolves chain name/slug to chain ID', () => {
    expect(parseChainIdFromUrlSegment('arbitrum')).toBe(SupportedChainId.ARBITRUM_ONE)
    expect(parseChainIdFromUrlSegment('arbitrum-one')).toBe(SupportedChainId.ARBITRUM_ONE)
    expect(parseChainIdFromUrlSegment('sepolia')).toBe(SupportedChainId.SEPOLIA)
  })

  it('returns null for invalid segment', () => {
    expect(parseChainIdFromUrlSegment('unknown')).toBeNull()
    expect(parseChainIdFromUrlSegment('')).toBeNull()
    expect(parseChainIdFromUrlSegment(null)).toBeNull()
    expect(parseChainIdFromUrlSegment(undefined)).toBeNull()
  })
})
