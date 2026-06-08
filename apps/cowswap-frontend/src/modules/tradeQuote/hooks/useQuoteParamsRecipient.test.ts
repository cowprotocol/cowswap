import { AdditionalTargetChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo, WalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { TradeDerivedState, useDerivedTradeState } from 'modules/trade'

import { useQuoteParamsRecipient } from './useQuoteParamsRecipient'
import { useTradeQuote } from './useTradeQuote'

import { TradeQuoteState } from '../state/tradeQuoteAtom'
import { COW_QUOTE_BTC_BRIDGE_RECIPIENT, COW_QUOTE_SOL_BRIDGE_RECIPIENT } from '../utils/getBridgeQuoteSigner'

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

function mockState(recipient?: string, recipientAddress?: string, outputChainId?: number): void {
  mockedUseDerivedTradeState.mockReturnValue({
    recipient,
    recipientAddress,
    outputCurrency: outputChainId !== undefined ? { chainId: outputChainId } : null,
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

      expect(result.current).toEqual({
        receiver: ACCOUNT_ADDRESS,
        bridgeRecipient: ACCOUNT_ADDRESS,
      })
    })

    it('should use recipientAddress when recipient is ENS name with resolved address', () => {
      mockState(ENS_NAME, ANOTHER_VALID_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ANOTHER_VALID_ADDRESS, bridgeRecipient: ANOTHER_VALID_ADDRESS })
    })

    it('should fall back to account when recipient is invalid', () => {
      mockState(INVALID_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: ACCOUNT_ADDRESS })
    })

    it('should fall back to account when recipient is not set', () => {
      mockState(undefined)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: ACCOUNT_ADDRESS })
    })
  })

  describe('Non-ReceiverAccountBridgeProvider (HookBridgeProvider)', () => {
    beforeEach(() => {
      mockBridgeQuote('HookBridgeProvider')
    })

    it('should return recipientAddress when it is a valid address', () => {
      mockState(undefined, VALID_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: VALID_ADDRESS, bridgeRecipient: VALID_ADDRESS })
    })

    it('should return account when recipientAddress is undefined', () => {
      mockState(undefined)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: ACCOUNT_ADDRESS })
    })

    it('should return account when recipientAddress is invalid', () => {
      mockState(undefined, INVALID_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: ACCOUNT_ADDRESS })
    })

    it('should ignore recipient and use recipientAddress when both are valid EVM', () => {
      mockState(VALID_ADDRESS, ANOTHER_VALID_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ANOTHER_VALID_ADDRESS, bridgeRecipient: ANOTHER_VALID_ADDRESS })
    })

    it('should use recipient when recipientAddress is not set', () => {
      mockState(VALID_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: VALID_ADDRESS, bridgeRecipient: VALID_ADDRESS })
    })
  })

  describe('No bridge quote (first render / same-chain swap)', () => {
    beforeEach(() => {
      mockBridgeQuote(undefined)
    })

    it('should return recipientAddress when it is a valid address', () => {
      mockState(undefined, VALID_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: VALID_ADDRESS, bridgeRecipient: VALID_ADDRESS })
    })

    it('should return account when nothing is set', () => {
      mockState(undefined)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: ACCOUNT_ADDRESS })
    })

    it('should return recipient when it is a valid EVM address', () => {
      mockState(VALID_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: VALID_ADDRESS, bridgeRecipient: VALID_ADDRESS })
    })

    it('should return account when recipient is invalid non-EVM/non-Solana/non-BTC string', () => {
      mockState(INVALID_ADDRESS)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: ACCOUNT_ADDRESS })
    })
  })

  describe('Non-EVM recipients gated by output chain', () => {
    beforeEach(() => {
      mockBridgeQuote(undefined)
    })

    it('should accept SOL address when output chain is SOL', () => {
      mockState(SOLANA_ADDRESS, undefined, AdditionalTargetChainId.SOLANA)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: SOLANA_ADDRESS })
    })

    it('should accept BTC address when output chain is BTC', () => {
      mockState(BTC_ADDRESS, undefined, AdditionalTargetChainId.BITCOIN)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: BTC_ADDRESS })
    })

    it('should use BTC placeholder when SOL address is given but output chain is BTC (wrong chain)', () => {
      mockState(SOLANA_ADDRESS, undefined, AdditionalTargetChainId.BITCOIN)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: COW_QUOTE_BTC_BRIDGE_RECIPIENT })
    })

    it('should use SOL placeholder when BTC address is given but output chain is SOL (wrong chain)', () => {
      mockState(BTC_ADDRESS, undefined, AdditionalTargetChainId.SOLANA)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: COW_QUOTE_SOL_BRIDGE_RECIPIENT })
    })

    it('should reject SOL address when output chain is EVM (chainId=1)', () => {
      mockState(SOLANA_ADDRESS, undefined, 1)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: ACCOUNT_ADDRESS })
    })

    it('should reject BTC address when output chain is EVM (chainId=1)', () => {
      mockState(BTC_ADDRESS, undefined, 1)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: ACCOUNT_ADDRESS })
    })

    it('should accept SOL address when outputCurrency is null (backward compat)', () => {
      mockState(SOLANA_ADDRESS, undefined, undefined)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: SOLANA_ADDRESS })
    })

    it('should accept BTC address when outputCurrency is null (backward compat)', () => {
      mockState(BTC_ADDRESS, undefined, undefined)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: BTC_ADDRESS })
    })
  })

  describe('Default non-EVM bridge recipient for quoting (no recipient set)', () => {
    beforeEach(() => {
      mockBridgeQuote(undefined)
    })

    it('should return default SOL address when output chain is SOL and no recipient is set', () => {
      mockState(undefined, undefined, AdditionalTargetChainId.SOLANA)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: COW_QUOTE_SOL_BRIDGE_RECIPIENT })
    })

    it('should return default BTC address when output chain is BTC and no recipient is set', () => {
      mockState(undefined, undefined, AdditionalTargetChainId.BITCOIN)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: COW_QUOTE_BTC_BRIDGE_RECIPIENT })
    })

    it('should return undefined bridgeRecipient when output chain is EVM and no recipient is set', () => {
      mockState(undefined, undefined, 1)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: ACCOUNT_ADDRESS })
    })

    it('should return undefined bridgeRecipient when outputCurrency is null and no recipient is set', () => {
      mockState(undefined, undefined, undefined)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: ACCOUNT_ADDRESS })
    })
  })

  describe('Non-EVM output chain: falls back to default placeholder when recipient is invalid or wrong-chain', () => {
    beforeEach(() => {
      mockBridgeQuote(undefined)
    })

    it('should use BTC placeholder when user has typed a partial/invalid BTC address on BTC chain', () => {
      mockState('bc1q_partial', undefined, AdditionalTargetChainId.BITCOIN)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: COW_QUOTE_BTC_BRIDGE_RECIPIENT })
    })

    it('should use SOL placeholder when user has typed a partial/invalid SOL address on SOL chain', () => {
      mockState('sol_partial', undefined, AdditionalTargetChainId.SOLANA)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: COW_QUOTE_SOL_BRIDGE_RECIPIENT })
    })

    it('should use BTC placeholder when user has typed a SOL address on BTC chain (wrong chain)', () => {
      mockState(SOLANA_ADDRESS, undefined, AdditionalTargetChainId.BITCOIN)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: COW_QUOTE_BTC_BRIDGE_RECIPIENT })
    })

    it('should use SOL placeholder when user has typed a BTC address on SOL chain (wrong chain)', () => {
      mockState(BTC_ADDRESS, undefined, AdditionalTargetChainId.SOLANA)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toEqual({ receiver: ACCOUNT_ADDRESS, bridgeRecipient: COW_QUOTE_SOL_BRIDGE_RECIPIENT })
    })
  })
})
