import { SupportedChainId, ChainInfo } from '@cowprotocol/cow-sdk'

import { sortChainsByDisplayOrder } from './sortChainsByDisplayOrder'

const createChainInfo = (id: number, name = `Chain ${id}`): ChainInfo =>
  ({
    id,
    name,
    label: name,
    logo: '',
  }) as unknown as ChainInfo

const MAINNET = createChainInfo(SupportedChainId.MAINNET, 'Ethereum')
const GNOSIS = createChainInfo(SupportedChainId.GNOSIS_CHAIN, 'Gnosis')
const ARBITRUM = createChainInfo(SupportedChainId.ARBITRUM_ONE, 'Arbitrum')
const BASE = createChainInfo(SupportedChainId.BASE, 'Base')
const POLYGON = createChainInfo(SupportedChainId.POLYGON, 'Polygon')
const UNSUPPORTED_1 = createChainInfo(999991, 'Unsupported 1')
const UNSUPPORTED_2 = createChainInfo(999992, 'Unsupported 2')

describe('sortChainsByDisplayOrder', () => {
  describe('basic sorting', () => {
    it('returns empty array for empty input', () => {
      const result = sortChainsByDisplayOrder([])

      expect(result).toEqual([])
    })

    it('returns a copy for single chain', () => {
      const input = [MAINNET]
      const result = sortChainsByDisplayOrder(input)

      expect(result).toEqual([MAINNET])
      expect(result).not.toBe(input)
    })

    it('does not mutate the original array', () => {
      const input = [GNOSIS, MAINNET, ARBITRUM]
      const inputCopy = [...input]

      sortChainsByDisplayOrder(input)

      expect(input).toEqual(inputCopy)
    })

    it('sorts chains by canonical order', () => {
      // Input in wrong order: Gnosis, Arbitrum, Base, Mainnet
      const input = [GNOSIS, ARBITRUM, BASE, MAINNET]
      const result = sortChainsByDisplayOrder(input)

      // Expected order: Mainnet, Base, Arbitrum, Gnosis
      expect(result.map((c) => c.id)).toEqual([
        SupportedChainId.MAINNET,
        SupportedChainId.BASE,
        SupportedChainId.ARBITRUM_ONE,
        SupportedChainId.GNOSIS_CHAIN,
      ])
    })

    it('places unsupported chains at the end', () => {
      const input = [UNSUPPORTED_1, MAINNET, GNOSIS]
      const result = sortChainsByDisplayOrder(input)

      expect(result.map((c) => c.id)).toEqual([
        SupportedChainId.MAINNET,
        SupportedChainId.GNOSIS_CHAIN,
        UNSUPPORTED_1.id,
      ])
    })

    it('maintains relative order of unsupported chains', () => {
      const input = [UNSUPPORTED_2, MAINNET, UNSUPPORTED_1]
      const result = sortChainsByDisplayOrder(input)

      // Unsupported chains should maintain their original relative order
      expect(result.map((c) => c.id)).toEqual([SupportedChainId.MAINNET, UNSUPPORTED_2.id, UNSUPPORTED_1.id])
    })

    it('handles all unsupported chains', () => {
      const input = [UNSUPPORTED_2, UNSUPPORTED_1]
      const result = sortChainsByDisplayOrder(input)

      // Should maintain original order when all have same weight
      expect(result.map((c) => c.id)).toEqual([UNSUPPORTED_2.id, UNSUPPORTED_1.id])
    })
  })

  describe('pinChainId option', () => {
    it('pins specified chain to first position', () => {
      const input = [MAINNET, BASE, ARBITRUM, GNOSIS]
      const result = sortChainsByDisplayOrder(input, { pinChainId: GNOSIS.id })

      expect(result[0].id).toBe(SupportedChainId.GNOSIS_CHAIN)
      // Rest should maintain sorted order
      expect(result.map((c) => c.id)).toEqual([
        SupportedChainId.GNOSIS_CHAIN,
        SupportedChainId.MAINNET,
        SupportedChainId.BASE,
        SupportedChainId.ARBITRUM_ONE,
      ])
    })

    it('does nothing when pinChainId is already first', () => {
      const input = [GNOSIS, ARBITRUM, MAINNET]
      const result = sortChainsByDisplayOrder(input, { pinChainId: MAINNET.id })

      // Mainnet is already first after sorting
      expect(result[0].id).toBe(SupportedChainId.MAINNET)
    })

    it('does nothing when pinChainId is not in the list', () => {
      const input = [MAINNET, ARBITRUM, GNOSIS]
      const result = sortChainsByDisplayOrder(input, { pinChainId: POLYGON.id })

      // Should just return sorted order
      expect(result.map((c) => c.id)).toEqual([
        SupportedChainId.MAINNET,
        SupportedChainId.ARBITRUM_ONE,
        SupportedChainId.GNOSIS_CHAIN,
      ])
    })

    it('works with undefined options', () => {
      const input = [GNOSIS, MAINNET]
      const result = sortChainsByDisplayOrder(input, undefined)

      expect(result.map((c) => c.id)).toEqual([SupportedChainId.MAINNET, SupportedChainId.GNOSIS_CHAIN])
    })

    it('works with empty options object', () => {
      const input = [GNOSIS, MAINNET]
      const result = sortChainsByDisplayOrder(input, {})

      expect(result.map((c) => c.id)).toEqual([SupportedChainId.MAINNET, SupportedChainId.GNOSIS_CHAIN])
    })

    it('can pin an unsupported chain to first position', () => {
      const input = [MAINNET, UNSUPPORTED_1, GNOSIS]
      const result = sortChainsByDisplayOrder(input, { pinChainId: UNSUPPORTED_1.id })

      expect(result[0].id).toBe(UNSUPPORTED_1.id)
    })
  })

  describe('stability', () => {
    it('maintains stable sort for chains with same canonical position', () => {
      // Create multiple chains that would have the same weight (unsupported)
      const chainA = createChainInfo(888881, 'Chain A')
      const chainB = createChainInfo(888882, 'Chain B')
      const chainC = createChainInfo(888883, 'Chain C')

      const input = [chainA, chainB, chainC]
      const result = sortChainsByDisplayOrder(input)

      // Original order should be preserved for same-weight chains
      expect(result.map((c) => c.id)).toEqual([chainA.id, chainB.id, chainC.id])
    })
  })
})
