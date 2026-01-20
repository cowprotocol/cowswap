import { areAddressesEqual } from './areAddressesEqual'

describe('areAddressesEqual', () => {
  const ADDRESS_1 = '0xf164fc0ec4e93095b804a4795bbe1e041497b92a'
  const ADDRESS_1_CHECKSUMMED = '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a'
  const ADDRESS_2 = '0x2E1b342132A67Ea578e4E3B814bae2107dc254CC'

  describe('when both addresses are falsy', () => {
    it('returns false when both are null', () => {
      expect(areAddressesEqual(null, null)).toBe(false)
    })

    it('returns false when both are undefined', () => {
      expect(areAddressesEqual(undefined, undefined)).toBe(false)
    })

    it('returns false when both are empty strings', () => {
      expect(areAddressesEqual('', '')).toBe(false)
    })

    it('returns false when one is null and other is undefined', () => {
      expect(areAddressesEqual(null, undefined)).toBe(false)
    })
  })

  describe('when one address is falsy', () => {
    it('returns false when first is null', () => {
      expect(areAddressesEqual(null, ADDRESS_1)).toBe(false)
    })

    it('returns false when second is null', () => {
      expect(areAddressesEqual(ADDRESS_1, null)).toBe(false)
    })

    it('returns false when first is undefined', () => {
      expect(areAddressesEqual(undefined, ADDRESS_1)).toBe(false)
    })

    it('returns false when second is undefined', () => {
      expect(areAddressesEqual(ADDRESS_1, undefined)).toBe(false)
    })

    it('returns false when first is empty string', () => {
      expect(areAddressesEqual('', ADDRESS_1)).toBe(false)
    })

    it('returns false when second is empty string', () => {
      expect(areAddressesEqual(ADDRESS_1, '')).toBe(false)
    })
  })

  describe('when both addresses are valid', () => {
    it('returns true for identical addresses', () => {
      expect(areAddressesEqual(ADDRESS_1, ADDRESS_1)).toBe(true)
    })

    it('returns true for same address with different casing', () => {
      expect(areAddressesEqual(ADDRESS_1, ADDRESS_1.toUpperCase())).toBe(true)
    })

    it('returns true for lowercase and checksummed versions', () => {
      expect(areAddressesEqual(ADDRESS_1, ADDRESS_1_CHECKSUMMED)).toBe(true)
    })

    it('returns false for different addresses', () => {
      expect(areAddressesEqual(ADDRESS_1, ADDRESS_2)).toBe(false)
    })
  })
})
