import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getChainContextValue, getChainSwitchedEvent, shouldTrackChainSwitchedEvent } from './useAnalyticsReporter'

describe('useAnalyticsReporter chain_switched helpers', () => {
  describe('shouldTrackChainSwitchedEvent', () => {
    it('returns true when wallet is connected and chain changed', () => {
      expect(
        shouldTrackChainSwitchedEvent({
          account: '0x1111111111111111111111111111111111111111',
          prevAccount: '0x1111111111111111111111111111111111111111',
          chainId: SupportedChainId.MAINNET,
          prevChainId: SupportedChainId.ARBITRUM_ONE,
        }),
      ).toBe(true)
    })

    it('returns true when same wallet casing changes and chain changed', () => {
      expect(
        shouldTrackChainSwitchedEvent({
          account: '0x1111111111111111111111111111111111111111',
          prevAccount: '0x1111111111111111111111111111111111111111'.toUpperCase(),
          chainId: SupportedChainId.MAINNET,
          prevChainId: SupportedChainId.ARBITRUM_ONE,
        }),
      ).toBe(true)
    })

    it('returns false when current account is missing', () => {
      expect(
        shouldTrackChainSwitchedEvent({
          account: undefined,
          prevAccount: '0x1111111111111111111111111111111111111111',
          chainId: SupportedChainId.MAINNET,
          prevChainId: SupportedChainId.ARBITRUM_ONE,
        }),
      ).toBe(false)
    })

    it('returns false when previous account is missing (first wallet connect)', () => {
      expect(
        shouldTrackChainSwitchedEvent({
          account: '0x1111111111111111111111111111111111111111',
          prevAccount: undefined,
          chainId: SupportedChainId.MAINNET,
          prevChainId: SupportedChainId.ARBITRUM_ONE,
        }),
      ).toBe(false)
    })

    it('returns false when chain id did not change', () => {
      expect(
        shouldTrackChainSwitchedEvent({
          account: '0x1111111111111111111111111111111111111111',
          prevAccount: '0x1111111111111111111111111111111111111111',
          chainId: SupportedChainId.MAINNET,
          prevChainId: SupportedChainId.MAINNET,
        }),
      ).toBe(false)
    })

    it('returns false when account changed (account switch, not chain switch)', () => {
      expect(
        shouldTrackChainSwitchedEvent({
          account: '0x1111111111111111111111111111111111111111',
          prevAccount: '0x2222222222222222222222222222222222222222',
          chainId: SupportedChainId.MAINNET,
          prevChainId: SupportedChainId.ARBITRUM_ONE,
        }),
      ).toBe(false)
    })
  })

  describe('getChainSwitchedEvent', () => {
    it('builds expected analytics payload', () => {
      expect(getChainSwitchedEvent(SupportedChainId.MAINNET, SupportedChainId.ARBITRUM_ONE)).toEqual({
        category: 'Wallet',
        action: 'chain_switched',
        previousChainId: '1',
        newChainId: '42161',
      })
    })
  })

  describe('getChainContextValue', () => {
    it('returns stringified chain id when present', () => {
      expect(getChainContextValue(SupportedChainId.BASE)).toBe('8453')
    })

    it('returns undefined when chain is absent', () => {
      expect(getChainContextValue(undefined)).toBeUndefined()
    })
  })
})
