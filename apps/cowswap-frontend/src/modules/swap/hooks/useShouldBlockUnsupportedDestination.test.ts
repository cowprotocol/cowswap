import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useIsCoinbaseWallet, useWalletInfo, useWalletSupportedChainIds } from '@cowprotocol/wallet'
import type { WalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useIsCurrentTradeBridging } from 'modules/trade/hooks/useIsCurrentTradeBridging'

import { useShouldBlockUnsupportedDestination } from './useShouldBlockUnsupportedDestination'
import { useSwapDerivedState } from './useSwapDerivedState'

import type { SwapDerivedState } from '../state/swapRawStateAtom'

jest.mock('@cowprotocol/wallet', () => ({
  useIsCoinbaseWallet: jest.fn(),
  useWalletInfo: jest.fn(),
  useWalletSupportedChainIds: jest.fn(),
}))

jest.mock('modules/trade/hooks/useIsCurrentTradeBridging', () => ({
  useIsCurrentTradeBridging: jest.fn(),
}))

jest.mock('./useSwapDerivedState', () => ({
  useSwapDerivedState: jest.fn(),
}))

const mockUseIsCoinbaseWallet = useIsCoinbaseWallet as jest.MockedFunction<typeof useIsCoinbaseWallet>
const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseWalletSupportedChainIds = useWalletSupportedChainIds as jest.MockedFunction<
  typeof useWalletSupportedChainIds
>
const mockUseIsCurrentTradeBridging = useIsCurrentTradeBridging as jest.MockedFunction<typeof useIsCurrentTradeBridging>
const mockUseSwapDerivedState = useSwapDerivedState as jest.MockedFunction<typeof useSwapDerivedState>

const ACCOUNT = '0xCoinbaseScwAddress'
const EXTERNAL_RECIPIENT = '0xExternalAddress'

function setupDefaults(overrides?: {
  isCoinbaseWallet?: boolean
  walletSupportedChainIds?: Set<number> | null // null = use default, undefined = pass undefined
  isBridging?: boolean
  account?: string
  recipient?: string | null
  recipientAddress?: string | null
  outputChainId?: number
}): void {
  const {
    isCoinbaseWallet = true,
    isBridging = true,
    account = ACCOUNT,
    recipient = undefined,
    recipientAddress = undefined,
    outputChainId = SupportedChainId.GNOSIS_CHAIN,
  } = overrides ?? {}

  // Use null sentinel to distinguish "not specified" (use default Set) from "explicitly undefined"
  const walletSupportedChainIds =
    overrides && 'walletSupportedChainIds' in overrides
      ? (overrides.walletSupportedChainIds ?? undefined)
      : new Set([SupportedChainId.MAINNET, SupportedChainId.BASE])

  mockUseIsCoinbaseWallet.mockReturnValue(isCoinbaseWallet)
  mockUseWalletSupportedChainIds.mockReturnValue(walletSupportedChainIds)
  mockUseIsCurrentTradeBridging.mockReturnValue(isBridging)
  mockUseWalletInfo.mockReturnValue({ account } as WalletInfo)
  mockUseSwapDerivedState.mockReturnValue({
    recipient,
    recipientAddress,
    outputCurrency:
      outputChainId !== undefined
        ? ({ chainId: outputChainId } as unknown as SwapDerivedState['outputCurrency'])
        : null,
  } as SwapDerivedState)
}

describe('useShouldBlockUnsupportedDestination', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // --- Coinbase scoping ---

  it('returns true for Coinbase SCW bridging to unsupported chain with no external recipient', () => {
    setupDefaults()

    const { result } = renderHook(() => useShouldBlockUnsupportedDestination())
    expect(result.current).toBe(true)
  })

  it('returns false for non-Coinbase wallet even with unsupported destination', () => {
    setupDefaults({ isCoinbaseWallet: false })

    const { result } = renderHook(() => useShouldBlockUnsupportedDestination())
    expect(result.current).toBe(false)
  })

  it('returns false for Coinbase EOA (walletSupportedChainIds undefined)', () => {
    setupDefaults({ walletSupportedChainIds: undefined })

    const { result } = renderHook(() => useShouldBlockUnsupportedDestination())
    expect(result.current).toBe(false)
  })

  // --- Basic conditions ---

  it('returns false when not bridging', () => {
    setupDefaults({ isBridging: false })

    const { result } = renderHook(() => useShouldBlockUnsupportedDestination())
    expect(result.current).toBe(false)
  })

  it('returns false when destination is supported', () => {
    // BASE is in the supported set
    setupDefaults({ outputChainId: SupportedChainId.BASE })

    const { result } = renderHook(() => useShouldBlockUnsupportedDestination())
    expect(result.current).toBe(false)
  })

  it('returns false when walletSupportedChainIds is undefined (loading/EOA fallback)', () => {
    setupDefaults({ walletSupportedChainIds: undefined })

    const { result } = renderHook(() => useShouldBlockUnsupportedDestination())
    expect(result.current).toBe(false)
  })

  // --- Recipient logic (using resolved state, not UI toggle) ---

  it('returns true when unsupported dest + no recipient (recipient=undefined)', () => {
    setupDefaults({ recipient: undefined, recipientAddress: undefined })

    const { result } = renderHook(() => useShouldBlockUnsupportedDestination())
    expect(result.current).toBe(true)
  })

  it('returns true when unsupported dest + recipient is own address', () => {
    setupDefaults({ recipient: ACCOUNT })

    const { result } = renderHook(() => useShouldBlockUnsupportedDestination())
    expect(result.current).toBe(true)
  })

  it('returns true when unsupported dest + recipient is own address (case-insensitive)', () => {
    setupDefaults({ recipient: ACCOUNT.toUpperCase() })

    const { result } = renderHook(() => useShouldBlockUnsupportedDestination())
    expect(result.current).toBe(true)
  })

  it('returns false when unsupported dest + external recipient', () => {
    setupDefaults({ recipient: EXTERNAL_RECIPIENT })

    const { result } = renderHook(() => useShouldBlockUnsupportedDestination())
    expect(result.current).toBe(false)
  })

  it('returns false when unsupported dest + external recipientAddress (ENS-resolved)', () => {
    setupDefaults({ recipientAddress: EXTERNAL_RECIPIENT })

    const { result } = renderHook(() => useShouldBlockUnsupportedDestination())
    expect(result.current).toBe(false)
  })

  it('returns false when URL recipient (external recipientAddress, showRecipient=false)', () => {
    // URL provides ?recipient=0xDIFFERENT — recipientAddress is resolved, showRecipient may be false
    setupDefaults({ recipientAddress: EXTERNAL_RECIPIENT, recipient: undefined })

    const { result } = renderHook(() => useShouldBlockUnsupportedDestination())
    expect(result.current).toBe(false)
  })

  it('returns true when URL recipient is own address', () => {
    setupDefaults({ recipientAddress: ACCOUNT, recipient: undefined })

    const { result } = renderHook(() => useShouldBlockUnsupportedDestination())
    expect(result.current).toBe(true)
  })
})
