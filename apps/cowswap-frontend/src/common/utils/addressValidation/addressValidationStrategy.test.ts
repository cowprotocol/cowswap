import { AdditionalTargetChainId, SupportedChainId } from '@cowprotocol/cow-sdk'

import { getAddressValidationStrategy } from './addressValidationStrategy'

jest.mock('@cowprotocol/cow-sdk', () => {
  const actual = jest.requireActual('@cowprotocol/cow-sdk')
  return {
    ...actual,
    isBtcAddress: jest.fn((v: string) => v === 'bc1validbtcaddress'),
    isSolanaAddress: jest.fn((v: string) => v === 'SolanaValidAddress1111111111111111111111111'),
    isEvmChain: jest.fn((chainId: number) => chainId in actual.SupportedChainId),
  }
})

jest.mock('@cowprotocol/common-utils', () => ({
  isAddress: jest.fn((v: string) => v === '0x1234567890123456789012345678901234567890'),
}))

const VALID_EVM = '0x1234567890123456789012345678901234567890'
const VALID_BTC = 'bc1validbtcaddress'
const VALID_SOL = 'SolanaValidAddress1111111111111111111111111'

describe('getAddressValidationStrategy', () => {
  describe('undefined targetChainId → EVM strategy', () => {
    const strategy = getAddressValidationStrategy(undefined)

    it('returns supportsENS true', () => expect(strategy.supportsENS).toBe(true))
    it('returns placeholderKey evm', () => expect(strategy.placeholderKey).toBe('evm'))
    it('returns supportsChainPrefix true', () => expect(strategy.supportsChainPrefix).toBe(true))
    it('validates valid EVM address', () => expect(strategy.isValidAddress(VALID_EVM)).toBe(true))
    it('rejects invalid address', () => expect(strategy.isValidAddress('0xinvalid')).toBe(false))

    describe('pattern', () => {
      const re = (): RegExp => new RegExp(strategy.pattern)
      it('matches 0x hex address', () => expect(re().test(VALID_EVM)).toBe(true))
      it('matches plain .eth ENS name', () => expect(re().test('vitalik.eth')).toBe(true))
      it('matches subdomain ENS name', () => expect(re().test('foo.vitalik.eth')).toBe(true))
      it('rejects bare hex without 0x', () => expect(re().test('1234567890123456789012345678901234567890')).toBe(false))
      it('rejects short hex address', () => expect(re().test('0x1234')).toBe(false))
      it('rejects BTC address', () => expect(re().test('1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf')).toBe(false))
    })
  })

  describe('EVM chainId → EVM strategy', () => {
    const strategy = getAddressValidationStrategy(SupportedChainId.MAINNET)

    it('returns supportsENS true', () => expect(strategy.supportsENS).toBe(true))
    it('returns placeholderKey evm', () => expect(strategy.placeholderKey).toBe('evm'))
    it('validates valid EVM address', () => expect(strategy.isValidAddress(VALID_EVM)).toBe(true))
  })

  describe('BITCOIN chainId → BTC strategy', () => {
    const strategy = getAddressValidationStrategy(AdditionalTargetChainId.BITCOIN)

    it('returns supportsENS false', () => expect(strategy.supportsENS).toBe(false))
    it('returns placeholderKey nonEvm', () => expect(strategy.placeholderKey).toBe('nonEvm'))
    it('returns supportsChainPrefix false', () => expect(strategy.supportsChainPrefix).toBe(false))
    it('validates valid BTC address', () => expect(strategy.isValidAddress(VALID_BTC)).toBe(true))
    it('rejects invalid BTC address', () => expect(strategy.isValidAddress('0xinvalid')).toBe(false))

    describe('pattern', () => {
      const re = (): RegExp => new RegExp(strategy.pattern)
      it('matches P2PKH (legacy) address', () => expect(re().test('1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf')).toBe(true))
      it('matches P2SH address', () => expect(re().test('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBe(true))
      it('matches Bech32 (bc1q) address', () =>
        expect(re().test('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toBe(true))
      it('rejects EVM address', () => expect(re().test(VALID_EVM)).toBe(false))
      it('rejects Solana address', () => expect(re().test(VALID_SOL)).toBe(false))
    })
  })

  describe('SOLANA chainId → Solana strategy', () => {
    const strategy = getAddressValidationStrategy(AdditionalTargetChainId.SOLANA)

    it('returns supportsENS false', () => expect(strategy.supportsENS).toBe(false))
    it('returns placeholderKey nonEvm', () => expect(strategy.placeholderKey).toBe('nonEvm'))
    it('returns supportsChainPrefix false', () => expect(strategy.supportsChainPrefix).toBe(false))
    it('validates valid Solana address', () => expect(strategy.isValidAddress(VALID_SOL)).toBe(true))
    it('rejects invalid Solana address', () => expect(strategy.isValidAddress('0xinvalid')).toBe(false))

    describe('pattern', () => {
      const re = (): RegExp => new RegExp(strategy.pattern)
      // VALID_SOL contains 'l' (excluded from Base58) so use real addresses for pattern tests
      it('matches Wrapped SOL mint address', () =>
        expect(re().test('So11111111111111111111111111111111111111112')).toBe(true))
      it('matches another valid Solana address', () =>
        expect(re().test('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')).toBe(true))
      it('rejects address with invalid Base58 chars (0)', () =>
        expect(re().test('0o11111111111111111111111111111111111111112')).toBe(false))
      it('rejects address that is too short', () => expect(re().test('ABC123')).toBe(false))
      it('rejects EVM address', () => expect(re().test(VALID_EVM)).toBe(false))
    })
  })
})
