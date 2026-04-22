import { AdditionalTargetChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo, WalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { TradeDerivedState, useDerivedTradeState } from 'modules/trade'
import { BRIDGE_QUOTE_ACCOUNT } from 'modules/tradeQuote'

import { useBridgeQuoteRecipient } from './useBridgeQuoteRecipient'

jest.mock('@cowprotocol/wallet', () => ({ useWalletInfo: jest.fn() }))
jest.mock('modules/trade', () => ({ useDerivedTradeState: jest.fn() }))
jest.mock('modules/tradeQuote', () => ({
  BRIDGE_QUOTE_ACCOUNT: '0xD711bD26Bf5B153001a7C0ACcb289782b6f775e9',
}))

const mockedUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockedUseDerivedTradeState = useDerivedTradeState as jest.MockedFunction<typeof useDerivedTradeState>

const ACCOUNT = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
const EVM_RECIPIENT = '0x1234567890123456789012345678901234567890'
const BTC_ADDRESS = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
const SOLANA_ADDRESS = '9WfjPKjYvK5iPYzWetNVuHUArE9nBxuwtfXLoW8xhkQT'

function mockState(recipient?: string | null, outputChainId?: number): void {
  mockedUseDerivedTradeState.mockReturnValue({
    recipient,
    outputCurrency: outputChainId !== undefined ? { chainId: outputChainId } : null,
  } as unknown as TradeDerivedState)
}

describe('useBridgeQuoteRecipient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseWalletInfo.mockReturnValue({ account: ACCOUNT } as WalletInfo)
  })

  describe('EVM output chain', () => {
    it('returns account when no recipient is set', () => {
      mockState(undefined, 1)

      const { result } = renderHook(() => useBridgeQuoteRecipient())

      expect(result.current).toBe(ACCOUNT)
    })

    it('returns EVM recipient when set', () => {
      mockState(EVM_RECIPIENT, 1)

      const { result } = renderHook(() => useBridgeQuoteRecipient())

      expect(result.current).toBe(EVM_RECIPIENT)
    })

    it('returns BRIDGE_QUOTE_ACCOUNT when no recipient and no account', () => {
      mockedUseWalletInfo.mockReturnValue({ account: undefined } as unknown as WalletInfo)
      mockState(undefined, 1)

      const { result } = renderHook(() => useBridgeQuoteRecipient())

      expect(result.current).toBe(BRIDGE_QUOTE_ACCOUNT)
    })
  })

  describe('BTC output chain', () => {
    it('returns BRIDGE_QUOTE_ACCOUNT when no recipient is set — must NOT fall back to EVM account', () => {
      mockState(undefined, AdditionalTargetChainId.BITCOIN)

      const { result } = renderHook(() => useBridgeQuoteRecipient())

      // Bug: previously returned ACCOUNT (EVM address), displaying it as bridge destination
      expect(result.current).toBe(BRIDGE_QUOTE_ACCOUNT)
      expect(result.current).not.toBe(ACCOUNT)
    })

    it('returns BTC address when a valid BTC recipient is set', () => {
      mockState(BTC_ADDRESS, AdditionalTargetChainId.BITCOIN)

      const { result } = renderHook(() => useBridgeQuoteRecipient())

      expect(result.current).toBe(BTC_ADDRESS)
    })

    it('returns BRIDGE_QUOTE_ACCOUNT when no account and no recipient', () => {
      mockedUseWalletInfo.mockReturnValue({ account: undefined } as unknown as WalletInfo)
      mockState(undefined, AdditionalTargetChainId.BITCOIN)

      const { result } = renderHook(() => useBridgeQuoteRecipient())

      expect(result.current).toBe(BRIDGE_QUOTE_ACCOUNT)
    })
  })

  describe('Solana output chain', () => {
    it('returns BRIDGE_QUOTE_ACCOUNT when no recipient is set — must NOT fall back to EVM account', () => {
      mockState(undefined, AdditionalTargetChainId.SOLANA)

      const { result } = renderHook(() => useBridgeQuoteRecipient())

      // Bug: previously returned ACCOUNT (EVM address), displaying it as bridge destination
      expect(result.current).toBe(BRIDGE_QUOTE_ACCOUNT)
      expect(result.current).not.toBe(ACCOUNT)
    })

    it('returns Solana address when a valid Solana recipient is set', () => {
      mockState(SOLANA_ADDRESS, AdditionalTargetChainId.SOLANA)

      const { result } = renderHook(() => useBridgeQuoteRecipient())

      expect(result.current).toBe(SOLANA_ADDRESS)
    })

    it('returns BRIDGE_QUOTE_ACCOUNT when no account and no recipient', () => {
      mockedUseWalletInfo.mockReturnValue({ account: undefined } as unknown as WalletInfo)
      mockState(undefined, AdditionalTargetChainId.SOLANA)

      const { result } = renderHook(() => useBridgeQuoteRecipient())

      expect(result.current).toBe(BRIDGE_QUOTE_ACCOUNT)
    })
  })

  describe('No output currency (null)', () => {
    it('returns account when no recipient is set', () => {
      mockState(undefined, undefined)

      const { result } = renderHook(() => useBridgeQuoteRecipient())

      expect(result.current).toBe(ACCOUNT)
    })

    it('returns EVM recipient when set', () => {
      mockState(EVM_RECIPIENT, undefined)

      const { result } = renderHook(() => useBridgeQuoteRecipient())

      expect(result.current).toBe(EVM_RECIPIENT)
    })

    it('returns BRIDGE_QUOTE_ACCOUNT when no recipient and no account', () => {
      mockedUseWalletInfo.mockReturnValue({ account: undefined } as unknown as WalletInfo)
      mockState(undefined, undefined)

      const { result } = renderHook(() => useBridgeQuoteRecipient())

      expect(result.current).toBe(BRIDGE_QUOTE_ACCOUNT)
    })
  })
})
