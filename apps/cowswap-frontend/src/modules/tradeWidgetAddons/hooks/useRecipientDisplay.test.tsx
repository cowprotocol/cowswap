import { ReactElement, ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'

import { useRecipientDisplay } from './useRecipientDisplay'

// Type for RecipientRow props based on our usage in tests
interface RecipientRowProps {
  chainId?: SupportedChainId
  recipient?: string
  account?: string
  recipientEnsName?: string | null
  recipientChainId?: number
  showNetworkLogo?: boolean
}

// Mock the wallet info hook
const mockChainId = jest.fn(() => SupportedChainId.MAINNET)
jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: () => ({ chainId: mockChainId() }),
}))

// Mock the RecipientRow component
jest.mock('modules/trade', () => ({
  RecipientRow: 'RecipientRow',
}))

// Test constants and helpers
const validAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
const account = '0x1234567890123456789012345678901234567890'

// Helper function to safely cast ReactNode to ReactElement for testing
const getReactElement = (node: ReactNode): ReactElement<RecipientRowProps> | null => {
  return node && typeof node === 'object' && 'type' in node ? (node as ReactElement<RecipientRowProps>) : null
}

// TODO: Address the max lines per function lint error
// eslint-disable-next-line max-lines-per-function
describe('useRecipientDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockChainId.mockReturnValue(SupportedChainId.MAINNET)
  })

  describe('Bridge Transaction Scenarios', () => {
    const bridgeChainId = SupportedChainId.ARBITRUM_ONE

    it('should NOT display recipient row when user types ENS name for bridge transaction', () => {
      const { result } = renderHook(() =>
        useRecipientDisplay({
          recipient: validAddress, // ENS resolved to this address
          recipientEnsName: 'vitalik.eth', // User typed this
          recipientChainId: bridgeChainId,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current).toBeNull()
    })

    it('should display recipient row when user types valid address directly for bridge transaction', () => {
      const { result } = renderHook(() =>
        useRecipientDisplay({
          recipient: validAddress,
          recipientEnsName: null, // No ENS resolution
          recipientChainId: bridgeChainId,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      const element = getReactElement(result.current)
      expect(result.current).not.toBeNull()
      expect(element?.type).toBe('RecipientRow')
      expect(element?.props).toMatchObject({
        showNetworkLogo: true,
        recipientChainId: bridgeChainId,
        recipient: validAddress,
        recipientEnsName: null,
      })
    })

    it('should NOT display any ENS name in bridge transaction even if somehow passed', () => {
      const { result } = renderHook(() =>
        useRecipientDisplay({
          recipient: validAddress,
          recipientEnsName: 'sss.eth',
          recipientChainId: bridgeChainId,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current).toBeNull()
    })

    it('should NOT display invalid addresses for bridge transactions', () => {
      const { result } = renderHook(() =>
        useRecipientDisplay({
          recipient: 'invalid-address',
          recipientEnsName: null,
          recipientChainId: bridgeChainId,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current).toBeNull()
    })
  })

  describe('Regular Swap Scenarios', () => {
    describe('Mainnet Swaps with ENS Support', () => {
      it('should display recipient row with ENS name on mainnet', () => {
        const { result } = renderHook(() =>
          useRecipientDisplay({
            recipient: validAddress,
            recipientEnsName: 'vitalik.eth',
            recipientChainId: undefined, // Same chain swap
            account,
            isFeeDetailsOpen: false,
          }),
        )

        const element = getReactElement(result.current)
        expect(result.current).not.toBeNull()
        expect(element?.type).toBe('RecipientRow')
        expect(element?.props).toMatchObject({
          recipientEnsName: 'vitalik.eth',
          showNetworkLogo: false,
        })
      })

      it('should display recipient row with valid address on mainnet', () => {
        const { result } = renderHook(() =>
          useRecipientDisplay({
            recipient: validAddress,
            recipientEnsName: null,
            recipientChainId: undefined,
            account,
            isFeeDetailsOpen: false,
          }),
        )

        const element = getReactElement(result.current)
        expect(result.current).not.toBeNull()
        expect(element?.type).toBe('RecipientRow')
        expect(element?.props).toMatchObject({
          recipient: validAddress,
        })
      })

      it('should NOT display unresolved ENS names on mainnet', () => {
        const { result } = renderHook(() =>
          useRecipientDisplay({
            recipient: 'invalid.eth', // Unresolved ENS
            recipientEnsName: null,
            recipientChainId: undefined,
            account,
            isFeeDetailsOpen: false,
          }),
        )

        expect(result.current).toBeNull()
      })
    })

    describe('Non-Mainnet Swaps without ENS Support', () => {
      beforeEach(() => {
        mockChainId.mockReturnValue(SupportedChainId.ARBITRUM_ONE)
      })

      it('should display recipient row with valid address on non-mainnet', () => {
        const { result } = renderHook(() =>
          useRecipientDisplay({
            recipient: validAddress,
            recipientEnsName: null,
            recipientChainId: undefined,
            account,
            isFeeDetailsOpen: false,
          }),
        )

        expect(result.current).not.toBeNull()
      })

      it('should NOT display ENS names on non-mainnet chains', () => {
        const { result } = renderHook(() =>
          useRecipientDisplay({
            recipient: 'vitalik.eth',
            recipientEnsName: null,
            recipientChainId: undefined,
            account,
            isFeeDetailsOpen: false,
          }),
        )

        expect(result.current).toBeNull()
      })
    })
  })

  describe('Common Validation Rules', () => {
    it('should NOT display recipient when it matches the connected account', () => {
      const { result } = renderHook(() =>
        useRecipientDisplay({
          recipient: account,
          recipientEnsName: null,
          recipientChainId: undefined,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current).toBeNull()
    })

    it('should NOT display recipient when accordion is open', () => {
      const { result } = renderHook(() =>
        useRecipientDisplay({
          recipient: validAddress,
          recipientEnsName: null,
          recipientChainId: undefined,
          account,
          isFeeDetailsOpen: true, // Accordion is open
        }),
      )

      expect(result.current).toBeNull()
    })

    it('should handle null/undefined inputs gracefully', () => {
      const { result } = renderHook(() =>
        useRecipientDisplay({
          recipient: null,
          recipientEnsName: null,
          recipientChainId: undefined,
          account: null,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current).toBeNull()
    })

    it('should NOT display empty or invalid addresses', () => {
      const { result } = renderHook(() =>
        useRecipientDisplay({
          recipient: '',
          recipientEnsName: null,
          recipientChainId: undefined,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current).toBeNull()
    })
  })

  describe('Network Logo Display', () => {
    it('should show network logo for cross-chain transactions', () => {
      const { result } = renderHook(() =>
        useRecipientDisplay({
          recipient: validAddress,
          recipientEnsName: null,
          recipientChainId: SupportedChainId.ARBITRUM_ONE,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      const element = getReactElement(result.current)
      expect(result.current).not.toBeNull()
      expect(element?.props?.showNetworkLogo).toBe(true)
    })

    it('should NOT show network logo for same-chain transactions', () => {
      const { result } = renderHook(() =>
        useRecipientDisplay({
          recipient: validAddress,
          recipientEnsName: null,
          recipientChainId: SupportedChainId.MAINNET,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      const element = getReactElement(result.current)
      expect(result.current).not.toBeNull()
      expect(element?.props?.showNetworkLogo).toBe(false)
    })
  })

  describe('Edge Cases from Scenario Mapping', () => {
    it('should handle ENS loading state by not displaying anything', () => {
      const { result } = renderHook(() =>
        useRecipientDisplay({
          recipient: 'loading.eth',
          recipientEnsName: null, // Still resolving
          recipientChainId: undefined,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current).toBeNull()
    })

    it('should handle very long ENS names by rejecting them for bridge transactions', () => {
      const veryLongEns = 'a'.repeat(100) + '.eth'
      const { result } = renderHook(() =>
        useRecipientDisplay({
          recipient: validAddress, // Would resolve to this
          recipientEnsName: veryLongEns, // Very long ENS name
          recipientChainId: SupportedChainId.BASE, // Bridge transaction
          account,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current).toBeNull() // Should be rejected for bridge
    })

    it('should handle disconnected wallet state (no account)', () => {
      const { result } = renderHook(() =>
        useRecipientDisplay({
          recipient: validAddress,
          recipientEnsName: null,
          recipientChainId: undefined,
          account: null, // Disconnected wallet
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current).toBeNull()
    })

    it('should handle disconnected wallet state (undefined account)', () => {
      const { result } = renderHook(() =>
        useRecipientDisplay({
          recipient: validAddress,
          recipientEnsName: null,
          recipientChainId: undefined,
          account: undefined, // Disconnected wallet
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current).toBeNull()
    })

    it('should use fallback chain ID when recipientChainId is not provided', () => {
      const { result } = renderHook(() =>
        useRecipientDisplay({
          recipient: validAddress,
          recipientEnsName: null,
          recipientChainId: undefined,
          account,
          isFeeDetailsOpen: false,
          fallbackChainId: SupportedChainId.GNOSIS_CHAIN,
        }),
      )

      const element = getReactElement(result.current)
      expect(result.current).not.toBeNull()
      expect(element?.props?.chainId).toBe(SupportedChainId.GNOSIS_CHAIN)
    })

    it('should handle case-insensitive account comparison', () => {
      const { result } = renderHook(() =>
        useRecipientDisplay({
          recipient: account.toUpperCase(), // Different case
          recipientEnsName: null,
          recipientChainId: undefined,
          account: account.toLowerCase(),
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current).toBeNull()
    })
  })

  describe('Critical Security Scenarios', () => {
    it('should NEVER allow ENS for bridge even if resolved to valid address', () => {
      // This is the critical bug we fixed - even if ENS resolves, bridge should reject it
      const { result } = renderHook(() =>
        useRecipientDisplay({
          recipient: validAddress, // Resolved from vitalik.eth
          recipientEnsName: 'vitalik.eth', // User typed ENS
          recipientChainId: SupportedChainId.POLYGON,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current).toBeNull() // Must be null for security
    })

    it('should allow same address for bridge if typed directly (not from ENS)', () => {
      // Same address but typed directly, not resolved from ENS
      const { result } = renderHook(() =>
        useRecipientDisplay({
          recipient: validAddress,
          recipientEnsName: null, // No ENS involved
          recipientChainId: SupportedChainId.POLYGON,
          account,
          isFeeDetailsOpen: false,
        }),
      )

      expect(result.current).not.toBeNull() // Should display
    })
  })
})

describe('useRecipientDisplay - All Supported Chains Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockChainId.mockReturnValue(SupportedChainId.MAINNET)
  })

  describe('Network Badge Tests', () => {
    const allSupportedChains = [
      { chainId: SupportedChainId.POLYGON, name: 'Polygon' },
      { chainId: SupportedChainId.BASE, name: 'Base' },
      { chainId: SupportedChainId.GNOSIS_CHAIN, name: 'Gnosis' },
      { chainId: SupportedChainId.ARBITRUM_ONE, name: 'Arbitrum' },
    ]

    allSupportedChains.forEach(({ chainId, name }) => {
      it(`should show network badge for bridge to ${name}`, () => {
        const { result } = renderHook(() =>
          useRecipientDisplay({
            recipient: validAddress,
            recipientEnsName: null,
            recipientChainId: chainId,
            account,
            isFeeDetailsOpen: false,
          }),
        )

        const element = getReactElement(result.current)
        expect(result.current).not.toBeNull()
        expect(element?.props?.showNetworkLogo).toBe(true)
        expect(element?.props?.recipientChainId).toBe(chainId)
      })

      it(`should reject ENS names for bridge to ${name}`, () => {
        const { result } = renderHook(() =>
          useRecipientDisplay({
            recipient: validAddress,
            recipientEnsName: 'vitalik.eth', // ENS name
            recipientChainId: chainId,
            account,
            isFeeDetailsOpen: false,
          }),
        )

        expect(result.current).toBeNull() // Must reject ENS for bridge
      })
    })

    it('should test from all supported chains to mainnet bridges', () => {
      allSupportedChains.forEach(({ chainId: sourceChain }) => {
        mockChainId.mockReturnValue(sourceChain)

        const { result } = renderHook(() =>
          useRecipientDisplay({
            recipient: validAddress,
            recipientEnsName: null,
            recipientChainId: SupportedChainId.MAINNET, // Bridge to mainnet
            account,
            isFeeDetailsOpen: false,
          }),
        )

        const element = getReactElement(result.current)
        expect(result.current).not.toBeNull()
        expect(element?.props?.showNetworkLogo).toBe(true)
        expect(element?.props?.recipientChainId).toBe(SupportedChainId.MAINNET)
      })
    })
  })
})

describe('useRecipientDisplay - Non-Mainnet Chain ENS Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockChainId.mockReturnValue(SupportedChainId.MAINNET)
  })

  describe('ENS Rejection Tests', () => {
    const nonMainnetChains = [
      { chainId: SupportedChainId.POLYGON, name: 'Polygon' },
      { chainId: SupportedChainId.BASE, name: 'Base' },
      { chainId: SupportedChainId.GNOSIS_CHAIN, name: 'Gnosis' },
      { chainId: SupportedChainId.ARBITRUM_ONE, name: 'Arbitrum' },
    ]

    nonMainnetChains.forEach(({ chainId, name }) => {
      it(`should reject ENS names on ${name} for same-chain swaps`, () => {
        mockChainId.mockReturnValue(chainId)

        const { result } = renderHook(() =>
          useRecipientDisplay({
            recipient: 'vitalik.eth', // ENS name that won't resolve
            recipientEnsName: null, // ENS disabled on non-mainnet
            recipientChainId: undefined, // Same chain swap
            account,
            isFeeDetailsOpen: false,
          }),
        )

        expect(result.current).toBeNull() // Should reject ENS
      })

      it(`should accept valid addresses on ${name} for same-chain swaps`, () => {
        mockChainId.mockReturnValue(chainId)

        const { result } = renderHook(() =>
          useRecipientDisplay({
            recipient: validAddress,
            recipientEnsName: null, // No ENS
            recipientChainId: undefined, // Same chain swap
            account,
            isFeeDetailsOpen: false,
          }),
        )

        const element = getReactElement(result.current)
        expect(result.current).not.toBeNull()
        expect(element?.props?.showNetworkLogo).toBe(false) // Same chain = no badge
      })
    })
  })
})
