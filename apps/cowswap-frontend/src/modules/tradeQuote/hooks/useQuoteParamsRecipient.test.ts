import { useWalletInfo, WalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { TradeDerivedState, useDerivedTradeState } from 'modules/trade'
import { useRecipientRequirement } from 'modules/trade/hooks/useRecipientRequirement'

import { useQuoteParamsRecipient } from './useQuoteParamsRecipient'
import { useTradeQuote } from './useTradeQuote'

import { TradeQuoteState } from '../state/tradeQuoteAtom'

// Mock dependencies
jest.mock('./useTradeQuote')
jest.mock('modules/trade', () => ({
  useDerivedTradeState: jest.fn(),
}))
jest.mock('modules/trade/hooks/useRecipientRequirement', () => ({
  useRecipientRequirement: jest.fn(),
}))
jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

const mockedUseTradeQuote = useTradeQuote as jest.MockedFunction<typeof useTradeQuote>
const mockedUseDerivedTradeState = useDerivedTradeState as jest.MockedFunction<typeof useDerivedTradeState>
const mockedUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockedUseRecipientRequirement = useRecipientRequirement as jest.MockedFunction<typeof useRecipientRequirement>

const VALID_ADDRESS = '0x1234567890123456789012345678901234567890'
const ANOTHER_VALID_ADDRESS = '0x0987654321098765432109876543210987654321'
const ACCOUNT_ADDRESS = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
const INVALID_ADDRESS = 'not-an-address'
const ENS_NAME = 'vitalik.eth'

describe('useQuoteParamsRecipient', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock setup
    mockedUseWalletInfo.mockReturnValue({
      account: ACCOUNT_ADDRESS,
    } as unknown as WalletInfo)

    mockedUseRecipientRequirement.mockReturnValue({
      destinationChainId: undefined,
      destinationChainType: 'evm',
      isRecipientRequired: false,
      isRecipientBlocked: false,
      isRecipientValid: true,
      isRecipientMissing: false,
      recipientError: undefined,
      blockedQuoteMessage: undefined,
      toggleDisabled: false,
      toggleDisabledReason: undefined,
      warningText: undefined,
      recipient: '',
      isMismatch: false,
    })
  })

  describe('ReceiverAccountBridgeProvider', () => {
    beforeEach(() => {
      mockedUseTradeQuote.mockReturnValue({
        bridgeQuote: {
          providerInfo: {
            type: 'ReceiverAccountBridgeProvider',
          },
        },
      } as unknown as TradeQuoteState)
    })

    it('should return recipient when it is a valid address', () => {
      mockedUseDerivedTradeState.mockReturnValue({
        recipient: VALID_ADDRESS,
        recipientAddress: undefined,
      } as unknown as TradeDerivedState)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toBe(VALID_ADDRESS)
    })

    it('should return recipientAddress when recipient is ENS name', () => {
      mockedUseDerivedTradeState.mockReturnValue({
        recipient: ENS_NAME,
        recipientAddress: ANOTHER_VALID_ADDRESS,
      } as unknown as TradeDerivedState)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toBe(ANOTHER_VALID_ADDRESS)
    })

    it('should return account when recipient is invalid address', () => {
      mockedUseDerivedTradeState.mockReturnValue({
        recipient: INVALID_ADDRESS,
        recipientAddress: undefined,
      } as unknown as TradeDerivedState)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toBe(ACCOUNT_ADDRESS)
    })

    it('should return account when recipient is not set', () => {
      mockedUseDerivedTradeState.mockReturnValue({
        recipient: undefined,
        recipientAddress: undefined,
      } as unknown as TradeDerivedState)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toBe(ACCOUNT_ADDRESS)
    })
  })

  describe('Non-ReceiverAccountBridgeProvider', () => {
    beforeEach(() => {
      mockedUseTradeQuote.mockReturnValue({
        bridgeQuote: {
          providerInfo: {
            type: 'SomethingElseBridgeProvider',
          },
        },
      } as unknown as TradeQuoteState)
    })

    it('should return recipientAddress when it is a valid address', () => {
      mockedUseDerivedTradeState.mockReturnValue({
        recipient: undefined,
        recipientAddress: VALID_ADDRESS,
      } as unknown as TradeDerivedState)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toBe(VALID_ADDRESS)
    })

    it('should return account when recipientAddress is undefined', () => {
      mockedUseDerivedTradeState.mockReturnValue({
        recipient: undefined,
        recipientAddress: undefined,
      } as unknown as TradeDerivedState)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toBe(ACCOUNT_ADDRESS)
    })

    it('should return account when recipientAddress is invalid', () => {
      mockedUseDerivedTradeState.mockReturnValue({
        recipient: undefined,
        recipientAddress: INVALID_ADDRESS,
      } as unknown as TradeDerivedState)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toBe(ACCOUNT_ADDRESS)
    })

    it('should ignore recipient field and use recipientAddress', () => {
      mockedUseDerivedTradeState.mockReturnValue({
        recipient: VALID_ADDRESS,
        recipientAddress: ANOTHER_VALID_ADDRESS,
      } as unknown as TradeDerivedState)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toBe(ANOTHER_VALID_ADDRESS)
    })
  })

  describe('No bridge quote', () => {
    beforeEach(() => {
      mockedUseTradeQuote.mockReturnValue({
        bridgeQuote: undefined,
      } as unknown as TradeQuoteState)
    })

    it('should return recipientAddress when it is a valid address', () => {
      mockedUseDerivedTradeState.mockReturnValue({
        recipient: undefined,
        recipientAddress: VALID_ADDRESS,
      } as unknown as TradeDerivedState)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toBe(VALID_ADDRESS)
    })

    it('should return account when recipientAddress is undefined', () => {
      mockedUseDerivedTradeState.mockReturnValue({
        recipient: undefined,
        recipientAddress: undefined,
      } as unknown as TradeDerivedState)

      const { result } = renderHook(() => useQuoteParamsRecipient())

      expect(result.current).toBe(ACCOUNT_ADDRESS)
    })
  })
})
