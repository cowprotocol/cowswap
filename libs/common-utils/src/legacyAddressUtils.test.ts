import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getBlockExplorerUrl, isAddress, isCowOrder, safeShortenAddress, shortenAddress } from './legacyAddressUtils'

describe('utils', () => {
  describe('#isAddress', () => {
    it('returns false if not', () => {
      expect(isAddress('')).toBe(false)
      expect(isAddress('0x0000')).toBe(false)
    })

    it('returns the checksummed address', () => {
      expect(isAddress('0xf164fc0ec4e93095b804a4795bbe1e041497b92a')).toBe('0xf164fC0Ec4E93095b804a4795bBe1e041497b92a')
      expect(isAddress('0xf164fC0Ec4E93095b804a4795bBe1e041497b92a')).toBe('0xf164fC0Ec4E93095b804a4795bBe1e041497b92a')
    })

    it('succeeds even without prefix', () => {
      expect(isAddress('f164fc0ec4e93095b804a4795bbe1e041497b92a')).toBe('0xf164fC0Ec4E93095b804a4795bBe1e041497b92a')
    })
    it('fails if too long', () => {
      expect(isAddress('f164fc0ec4e93095b804a4795bbe1e041497b92a0')).toBe(false)
    })

    it('returns the address as-is for a valid Solana address', () => {
      expect(isAddress('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')).toBe(
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      )
    })
  })

  describe('#shortenAddress', () => {
    it('throws on invalid address', () => {
      expect(() => shortenAddress('abc')).toThrow("Invalid 'address'")
    })

    it('truncates middle characters', () => {
      expect(shortenAddress('0xf164fc0ec4e93095b804a4795bbe1e041497b92a')).toBe('0xf164...b92a')
    })

    it('renders checksummed address', () => {
      expect(shortenAddress('0x2E1b342132A67Ea578e4E3B814bae2107dc254CC'.toLowerCase())).toBe('0x2E1b...54CC')
    })
  })

  describe('#safeShortenAddress', () => {
    it('truncates middle characters', () => {
      expect(safeShortenAddress('0xf164fc0ec4e93095b804a4795bbe1e041497b92a')).toBe('0xf164...b92a')
    })

    it('returns the original value when it is not an address', () => {
      expect(safeShortenAddress('abc')).toBe('abc')
    })
  })

  describe('#getBlockExplorerUrl', () => {
    it('does not introduce double slashes for bare explorer origins', () => {
      expect(getBlockExplorerUrl(1, 'transaction', 'abc', 'https://etherscan.io')).toBe('https://etherscan.io/tx/abc')
    })
  })

  describe('#isCowOrder', () => {
    // 56 bytes on EVM, 32 bytes on Solana. The Solana id is the same length as an EVM transaction hash,
    // which is why the chain has to be part of the decision.
    const EVM_ORDER_ID = `0x${'a'.repeat(112)}`
    const SOLANA_ORDER_ID = `0x${'b'.repeat(64)}`
    const EVM_TX_HASH = `0x${'c'.repeat(64)}`
    // Solana transaction signatures are base58 and much longer than any order id.
    const SOLANA_TX_SIGNATURE = '5x8VXqZ8pQ2mJ7Yb1kL3nR4tW6uH9dF2sG5cA7eB1vN3mK4pQ8rT2yU6iO9aS1dF'

    it('recognises a Solana order id on a Solana chain', () => {
      expect(isCowOrder('transaction', SOLANA_ORDER_ID, SupportedChainId.SOLANA)).toBe(true)
    })

    it('does not mistake an EVM transaction hash for an order, despite the identical length', () => {
      expect(isCowOrder('transaction', EVM_TX_HASH, SupportedChainId.MAINNET)).toBe(false)
      expect(isCowOrder('transaction', EVM_TX_HASH)).toBe(false)
    })

    it('does not mistake a Solana transaction signature for an order', () => {
      expect(isCowOrder('transaction', SOLANA_TX_SIGNATURE, SupportedChainId.SOLANA)).toBe(false)
    })

    it('recognises an EVM order id, with or without a chain', () => {
      expect(isCowOrder('transaction', EVM_ORDER_ID, SupportedChainId.MAINNET)).toBe(true)
      expect(isCowOrder('transaction', EVM_ORDER_ID)).toBe(true)
    })

    it('only ever classifies transactions', () => {
      expect(isCowOrder('address', SOLANA_ORDER_ID, SupportedChainId.SOLANA)).toBe(false)
      expect(isCowOrder('transaction', undefined, SupportedChainId.SOLANA)).toBe(false)
    })
  })
})
