import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useRecipientValidation } from './useRecipientValidation'

// Mock the useWalletInfo hook
jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>

// Test data
const account = '0x1234567890123456789012345678901234567890'
const validAddress = '0x0987654321098765432109876543210987654321'

describe('useRecipientValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET } as ReturnType<typeof useWalletInfo>)
  })

  describe('Bridge Transaction Scenarios', () => {
    const bridgeChainId = SupportedChainId.ARBITRUM_ONE

    it('should return isValid: false when user types ENS name for bridge transaction', () => {
      const { result } = renderHook(() =>
        useRecipientValidation({
          recipient: validAddress, // ENS resolved to this address
          recipientEnsName: 'vitalik.eth', // User typed this
          recipientChainId: bridgeChainId,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current.isValid).toBe(false)
    })

    it('should return valid props when user types valid address directly for bridge transaction', () => {
      const { result } = renderHook(() =>
        useRecipientValidation({
          recipient: validAddress,
          recipientEnsName: null, // No ENS resolution
          recipientChainId: bridgeChainId,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current.isValid).toBe(true)
      if (result.current.isValid) {
        expect(result.current.props).toMatchObject({
          showNetworkLogo: true,
          recipientChainId: bridgeChainId,
          recipient: validAddress,
          recipientEnsName: null,
        })
      }
    })

    it('should return isValid: false for invalid addresses in bridge transactions', () => {
      const { result } = renderHook(() =>
        useRecipientValidation({
          recipient: 'invalid-address',
          recipientEnsName: null,
          recipientChainId: bridgeChainId,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current.isValid).toBe(false)
    })
  })

  describe('Regular Swap Scenarios', () => {
    describe('Mainnet Swaps with ENS Support', () => {
      it('should return valid props with ENS name on mainnet', () => {
        const { result } = renderHook(() =>
          useRecipientValidation({
            recipient: validAddress,
            recipientEnsName: 'vitalik.eth',
            recipientChainId: undefined, // Same chain swap
            account,
            isFeeDetailsOpen: false,
          }),
        )

        expect(result.current.isValid).toBe(true)
        if (result.current.isValid) {
          expect(result.current.props).toMatchObject({
            recipientEnsName: 'vitalik.eth',
            showNetworkLogo: false,
          })
        }
      })

      it('should return valid props with valid address on mainnet', () => {
        const { result } = renderHook(() =>
          useRecipientValidation({
            recipient: validAddress,
            recipientEnsName: null,
            recipientChainId: undefined,
            account,
            isFeeDetailsOpen: false,
          }),
        )

        expect(result.current.isValid).toBe(true)
        if (result.current.isValid) {
          expect(result.current.props.recipient).toBe(validAddress)
        }
      })

      it('should return isValid: false for unresolved ENS names on mainnet', () => {
        const { result } = renderHook(() =>
          useRecipientValidation({
            recipient: 'invalid.eth', // Unresolved ENS
            recipientEnsName: null,
            recipientChainId: undefined,
            account,
            isFeeDetailsOpen: false,
          }),
        )

        expect(result.current.isValid).toBe(false)
      })
    })

    describe('Non-Mainnet Swaps without ENS Support', () => {
      beforeEach(() => {
        mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.ARBITRUM_ONE } as ReturnType<typeof useWalletInfo>)
      })

      it('should return valid props with valid address on non-mainnet', () => {
        const { result } = renderHook(() =>
          useRecipientValidation({
            recipient: validAddress,
            recipientEnsName: null,
            recipientChainId: undefined,
            account,
            isFeeDetailsOpen: false,
          }),
        )

        expect(result.current.isValid).toBe(true)
      })

      it('should return isValid: false for ENS names on non-mainnet chains', () => {
        const { result } = renderHook(() =>
          useRecipientValidation({
            recipient: 'vitalik.eth',
            recipientEnsName: null,
            recipientChainId: undefined,
            account,
            isFeeDetailsOpen: false,
          }),
        )

        expect(result.current.isValid).toBe(false)
      })
    })
  })

  describe('Common Validation Rules', () => {
    beforeEach(() => {
      mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET } as ReturnType<typeof useWalletInfo>)
    })

    it('should return isValid: false when recipient matches the connected account', () => {
      const { result } = renderHook(() =>
        useRecipientValidation({
          recipient: account,
          recipientEnsName: null,
          recipientChainId: undefined,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current.isValid).toBe(false)
    })

    it('should return isValid: false when accordion is open', () => {
      const { result } = renderHook(() =>
        useRecipientValidation({
          recipient: validAddress,
          recipientEnsName: null,
          recipientChainId: undefined,
          account,
          isFeeDetailsOpen: true, // Accordion is open
        }),
      )

      expect(result.current.isValid).toBe(false)
    })

    it('should return isValid: false for null/undefined inputs', () => {
      const { result } = renderHook(() =>
        useRecipientValidation({
          recipient: null,
          recipientEnsName: null,
          recipientChainId: undefined,
          account: null,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current.isValid).toBe(false)
    })

    it('should return isValid: false for empty or invalid addresses', () => {
      const { result } = renderHook(() =>
        useRecipientValidation({
          recipient: '',
          recipientEnsName: null,
          recipientChainId: undefined,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current.isValid).toBe(false)
    })
  })

  describe('Network Logo Display', () => {
    beforeEach(() => {
      mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET } as ReturnType<typeof useWalletInfo>)
    })

    it('should set showNetworkLogo: true for cross-chain transactions', () => {
      const { result } = renderHook(() =>
        useRecipientValidation({
          recipient: validAddress,
          recipientEnsName: null,
          recipientChainId: SupportedChainId.ARBITRUM_ONE,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current.isValid).toBe(true)
      if (result.current.isValid) {
        expect(result.current.props.showNetworkLogo).toBe(true)
      }
    })

    it('should set showNetworkLogo: false for same-chain transactions', () => {
      const { result } = renderHook(() =>
        useRecipientValidation({
          recipient: validAddress,
          recipientEnsName: null,
          recipientChainId: SupportedChainId.MAINNET,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current.isValid).toBe(true)
      if (result.current.isValid) {
        expect(result.current.props.showNetworkLogo).toBe(false)
      }
    })
  })

  describe('Chain ID Resolution', () => {
    beforeEach(() => {
      mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET } as ReturnType<typeof useWalletInfo>)
    })

    it('should use fallback chain ID when recipientChainId is not provided', () => {
      const { result } = renderHook(() =>
        useRecipientValidation({
          recipient: validAddress,
          recipientEnsName: null,
          recipientChainId: undefined,
          account,
          isFeeDetailsOpen: false,
          fallbackChainId: SupportedChainId.GNOSIS_CHAIN,
        }),
      )

      expect(result.current.isValid).toBe(true)
      if (result.current.isValid) {
        expect(result.current.props.chainId).toBe(SupportedChainId.GNOSIS_CHAIN)
      }
    })

    it('should handle case-insensitive account comparison', () => {
      const { result } = renderHook(() =>
        useRecipientValidation({
          recipient: account.toUpperCase(), // Different case
          recipientEnsName: null,
          recipientChainId: undefined,
          account: account.toLowerCase(),
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current.isValid).toBe(false)
    })
  })

  describe('Critical Security Scenarios', () => {
    beforeEach(() => {
      mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET } as ReturnType<typeof useWalletInfo>)
    })

    it('should NEVER allow ENS for bridge even if resolved to valid address', () => {
      // This is the critical bug we fixed - even if ENS resolves, bridge should reject it
      const { result } = renderHook(() =>
        useRecipientValidation({
          recipient: validAddress, // Resolved from vitalik.eth
          recipientEnsName: 'vitalik.eth', // User typed ENS
          recipientChainId: SupportedChainId.POLYGON,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current.isValid).toBe(false) // Must be false for security
    })

    it('should allow same address for bridge if typed directly (not from ENS)', () => {
      // Same address but typed directly, not resolved from ENS
      const { result } = renderHook(() =>
        useRecipientValidation({
          recipient: validAddress,
          recipientEnsName: null, // No ENS involved
          recipientChainId: SupportedChainId.POLYGON,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current.isValid).toBe(true) // Should be valid
    })

    it('should handle recipientChainId 0 correctly (edge case)', () => {
      const { result } = renderHook(() =>
        useRecipientValidation({
          recipient: validAddress,
          recipientEnsName: null,
          recipientChainId: 0, // Chain ID 0 - should not be treated as falsy
          account,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current.isValid).toBe(true) // Should be valid
      if (result.current.isValid) {
        expect(result.current.props.showNetworkLogo).toBe(true) // Should show network logo for chain ID 0
        expect(result.current.props.recipientChainId).toBe(0)
      }
    })
  })
})