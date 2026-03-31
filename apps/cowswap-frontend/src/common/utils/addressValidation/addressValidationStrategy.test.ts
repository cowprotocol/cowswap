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
  })

  describe('SOLANA chainId → Solana strategy', () => {
    const strategy = getAddressValidationStrategy(AdditionalTargetChainId.SOLANA)

    it('returns supportsENS false', () => expect(strategy.supportsENS).toBe(false))
    it('returns placeholderKey nonEvm', () => expect(strategy.placeholderKey).toBe('nonEvm'))
    it('returns supportsChainPrefix false', () => expect(strategy.supportsChainPrefix).toBe(false))
    it('validates valid Solana address', () => expect(strategy.isValidAddress(VALID_SOL)).toBe(true))
    it('rejects invalid Solana address', () => expect(strategy.isValidAddress('0xinvalid')).toBe(false))
  })
})
