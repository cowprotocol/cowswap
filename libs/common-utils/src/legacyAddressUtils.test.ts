import { i18n } from '@lingui/core'

import { getExplorerBaseUrl } from './explorer'
import {
  getBlockExplorerUrl,
  getEtherscanLink,
  getExplorerLabel,
  isAddress,
  safeShortenAddress,
  shortenAddress,
} from './legacyAddressUtils'

describe('utils', () => {
  describe('#getEtherscanLink', () => {
    const eventId = '1'.repeat(70)
    const uid = `0x${'a'.repeat(112)}`
    const hash = `0x${'b'.repeat(64)}`

    it.each([1, 100, 11155111])('routes TWAP event IDs to CoW Explorer on chain %s', (chainId) => {
      expect(getEtherscanLink(chainId, 'transaction', eventId)).toBe(`${getExplorerBaseUrl(chainId)}/twap/${eventId}`)
    })

    it('preserves order UID routing', () => {
      expect(getEtherscanLink(1, 'transaction', uid)).toBe(`${getExplorerBaseUrl(1)}/orders/${uid}`)
    })

    it('preserves transaction hash routing', () => {
      expect(getEtherscanLink(1, 'transaction', hash)).toBe(getBlockExplorerUrl(1, 'transaction', hash))
    })

    it('does not apply TWAP routing to other link types', () => {
      expect(getEtherscanLink(1, 'block', eventId)).toBe(getBlockExplorerUrl(1, 'block', eventId))
    })

    it('uses the CoW Explorer label for TWAPs', () => {
      i18n.loadAndActivate({ locale: 'en', messages: {} })
      expect(getExplorerLabel(1, 'transaction', eventId)).toBe(getExplorerLabel(1, 'transaction', uid))
    })
  })

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
})
