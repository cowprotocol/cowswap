import { NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { renderHook, waitFor } from '@testing-library/react'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsWrapOrUnwrap } from './useIsWrapOrUnwrap'
import { useSolanaWrapReceiveAmount } from './useSolanaWrapReceiveAmount'

import { getSolanaUnwrapPreview } from '../services/wrapNativeSolana/getSolanaUnwrapPreview'

const ACCOUNT = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
const SOL = NATIVE_CURRENCIES[SupportedChainId.SOLANA]
const WSOL = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA]
const CONNECTION = {}

// Mocked wholesale rather than spread over the real module: importing it for real instantiates the
// Reown AppKit adapters at module scope, which needs a browser.
jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('@reown/appkit-adapter-solana/react', () => ({
  useAppKitConnection: jest.fn(),
}))

jest.mock('./useDerivedTradeState', () => ({
  useDerivedTradeState: jest.fn(),
}))

jest.mock('./useIsWrapOrUnwrap', () => ({
  useIsWrapOrUnwrap: jest.fn(),
}))

jest.mock('../services/wrapNativeSolana/getSolanaUnwrapPreview', () => ({
  getSolanaUnwrapPreview: jest.fn(),
}))

const mockWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockConnection = useAppKitConnection as jest.MockedFunction<typeof useAppKitConnection>
const mockDerivedTradeState = useDerivedTradeState as jest.MockedFunction<typeof useDerivedTradeState>
const mockIsWrapOrUnwrap = useIsWrapOrUnwrap as jest.MockedFunction<typeof useIsWrapOrUnwrap>
const mockGetSolanaUnwrapPreview = getSolanaUnwrapPreview as jest.MockedFunction<typeof getSolanaUnwrapPreview>

describe('useSolanaWrapReceiveAmount', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockWalletInfo.mockReturnValue({ chainId: SupportedChainId.SOLANA, account: ACCOUNT } as ReturnType<
      typeof useWalletInfo
    >)
    mockConnection.mockReturnValue({ connection: CONNECTION } as unknown as ReturnType<typeof useAppKitConnection>)
    mockIsWrapOrUnwrap.mockReturnValue(true)
  })

  it('returns undefined on a non-Solana chain', () => {
    mockWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET, account: ACCOUNT } as ReturnType<
      typeof useWalletInfo
    >)
    mockDerivedTradeState.mockReturnValue({
      inputCurrencyAmount: CurrencyAmount.fromRawAmount(SOL, 500n),
    } as unknown as ReturnType<typeof useDerivedTradeState>)

    const { result } = renderHook(() => useSolanaWrapReceiveAmount())

    expect(result.current).toBeUndefined()
    expect(mockGetSolanaUnwrapPreview).not.toHaveBeenCalled()
  })

  it('returns undefined when the trade is not a wrap/unwrap', () => {
    mockIsWrapOrUnwrap.mockReturnValue(false)
    mockDerivedTradeState.mockReturnValue({
      inputCurrencyAmount: CurrencyAmount.fromRawAmount(SOL, 500n),
    } as unknown as ReturnType<typeof useDerivedTradeState>)

    const { result } = renderHook(() => useSolanaWrapReceiveAmount())

    expect(result.current).toBeUndefined()
  })

  it('mirrors the input as WSOL, synchronously, for the wrap direction', () => {
    mockDerivedTradeState.mockReturnValue({
      inputCurrencyAmount: CurrencyAmount.fromRawAmount(SOL, 500n),
    } as unknown as ReturnType<typeof useDerivedTradeState>)

    const { result } = renderHook(() => useSolanaWrapReceiveAmount())

    expect(result.current).toEqual(CurrencyAmount.fromRawAmount(WSOL, 500n))
    expect(mockGetSolanaUnwrapPreview).not.toHaveBeenCalled()
  })

  it('resolves the preview amount asynchronously for the unwrap direction', async () => {
    mockDerivedTradeState.mockReturnValue({
      inputCurrencyAmount: CurrencyAmount.fromRawAmount(WSOL, 1_000n),
    } as unknown as ReturnType<typeof useDerivedTradeState>)
    mockGetSolanaUnwrapPreview.mockResolvedValue({
      wsolBalance: 1_000n,
      receiveAmount: CurrencyAmount.fromRawAmount(SOL, 10_000n),
    })

    const { result } = renderHook(() => useSolanaWrapReceiveAmount())

    expect(result.current).toBeUndefined()

    await waitFor(() => expect(result.current).toEqual(CurrencyAmount.fromRawAmount(SOL, 10_000n)))

    expect(mockGetSolanaUnwrapPreview).toHaveBeenCalledWith(CONNECTION, expect.anything(), 1_000n)
  })

  it('falls back to undefined when the preview RPC call fails', async () => {
    mockDerivedTradeState.mockReturnValue({
      inputCurrencyAmount: CurrencyAmount.fromRawAmount(WSOL, 1_000n),
    } as unknown as ReturnType<typeof useDerivedTradeState>)
    mockGetSolanaUnwrapPreview.mockRejectedValue(new Error('RPC unavailable'))

    const { result } = renderHook(() => useSolanaWrapReceiveAmount())

    await waitFor(() => expect(mockGetSolanaUnwrapPreview).toHaveBeenCalled())

    expect(result.current).toBeUndefined()
  })
})
