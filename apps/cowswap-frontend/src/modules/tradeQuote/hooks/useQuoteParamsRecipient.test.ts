import { useWalletInfo, WalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { TradeDerivedState, useDerivedTradeState } from 'modules/trade'

import { useQuoteParamsRecipient } from './useQuoteParamsRecipient'
import { useTradeQuote } from './useTradeQuote'

import { TradeQuoteState } from '../state/tradeQuoteAtom'

// Mock dependencies
jest.mock('./useTradeQuote')
jest.mock('modules/trade', () => ({
  useDerivedTradeState: jest.fn(),
}))
jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

const mockedUseTradeQuote = useTradeQuote as jest.MockedFunction<typeof useTradeQuote>
const mockedUseDerivedTradeState = useDerivedTradeState as jest.MockedFunction<typeof useDerivedTradeState>
const mockedUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>

const VALID_ADDRESS = '0x1234567890123456789012345678901234567890'
const ANOTHER_VALID_ADDRESS = '0x0987654321098765432109876543210987654321'
const ACCOUNT_ADDRESS = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
const INVALID_ADDRESS = 'not-an-address'
const ENS_NAME = 'vitalik.eth'
const SOLANA_ADDRESS = '9WfjPKjYvK5iPYzWetNVuHUArE9nBxuwtfXLoW8xhkQT'
const BTC_ADDRESS = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'

function mockState(recipient?: string, recipientAddress?: string): void {
  mockedUseDerivedTradeState.mockReturnValue({
    recipient,
    recipientAddress,
  } as unknown as TradeDerivedState)
}

function mockBridgeQuote(providerType?: string): void {
  mockedUseTradeQuote.mockReturnValue({
    bridgeQuote: providerType
      ? {
          providerInfo: { type: providerType },
        }
      : undefined,
  } as unknown as TradeQuoteState)
}

describe('useQuoteParamsRecipient', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockedUseWalletInfo.mockReturnValue({
      account: ACCOUNT_ADDRESS,
    } as unknown as WalletInfo)
  })

  describe('Non-EVM recipients (Solana/BTC) — always passed as bridgeRecipient regardless of provider', () => {
    it('should return Solana address as bridgeRecipient and account as receiver (no bridge quote)', () => {
      mockBridgeQuote(undefined)
      mockState(SOLANA_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: SOLANA_ADDRESS })
    })

    it('should return Solana address as bridgeRecipient and account as receiver (with ReceiverAccountBridgeProvider)', () => {
      mockBridgeQuote('ReceiverAccountBridgeProvider')
      mockState(SOLANA_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: SOLANA_ADDRESS })
    })

    it('should return Solana address as bridgeRecipient and account as receiver (with HookBridgeProvider)', () => {
      mockBridgeQuote('HookBridgeProvider')
      mockState(SOLANA_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: SOLANA_ADDRESS })
    })

    it('should return BTC address as bridgeRecipient and account as receiver', () => {
      mockBridgeQuote(undefined)
      mockState(BTC_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: BTC_ADDRESS })
    })
  })

  describe('ReceiverAccountBridgeProvider with EVM recipient', () => {
    beforeEach(() => {
      mockBridgeQuote('ReceiverAccountBridgeProvider')
    })

    it('should return valid EVM recipient as both receiver and bridgeRecipient', () => {
      mockState(VALID_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: VALID_ADDRESS, bridgeRecipient: VALID_ADDRESS })
    })

    it('should fall back to account when recipient is ENS name without resolved address', () => {
      mockState(ENS_NAME)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: undefined })
    })

    it('should use recipientAddress when recipient is ENS name with resolved address', () => {
      mockState(ENS_NAME, ANOTHER_VALID_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ANOTHER_VALID_ADDRESS, bridgeRecipient: undefined })
    })

    it('should fall back to account when recipient is invalid', () => {
      mockState(INVALID_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: undefined })
    })

    it('should fall back to account when recipient is not set', () => {
      mockState(undefined)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: undefined })
    })
  })

  describe('Non-ReceiverAccountBridgeProvider (HookBridgeProvider)', () => {
    beforeEach(() => {
      mockBridgeQuote('HookBridgeProvider')
    })

    it('should return recipientAddress when it is a valid address', () => {
      mockState(undefined, VALID_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: VALID_ADDRESS, bridgeRecipient: undefined })
    })

    it('should return account when recipientAddress is undefined', () => {
      mockState(undefined)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: undefined })
    })

    it('should return account when recipientAddress is invalid', () => {
      mockState(undefined, INVALID_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: undefined })
    })

    it('should ignore recipient and use recipientAddress when both are valid EVM', () => {
      mockState(VALID_ADDRESS, ANOTHER_VALID_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ANOTHER_VALID_ADDRESS, bridgeRecipient: undefined })
    })

    it('should use recipient when recipientAddress is not set', () => {
      mockState(VALID_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: VALID_ADDRESS, bridgeRecipient: undefined })
    })
  })

  describe('No bridge quote (first render / same-chain swap)', () => {
    beforeEach(() => {
      mockBridgeQuote(undefined)
    })

    it('should return recipientAddress when it is a valid address', () => {
      mockState(undefined, VALID_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: VALID_ADDRESS, bridgeRecipient: undefined })
    })

    it('should return account when nothing is set', () => {
      mockState(undefined)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: undefined })
    })

    it('should return recipient when it is a valid EVM address', () => {
      mockState(VALID_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: VALID_ADDRESS, bridgeRecipient: undefined })
    })

    it('should return account when recipient is invalid non-EVM/non-Solana/non-BTC string', () => {
      mockState(INVALID_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: undefined })
    })
  })
})
