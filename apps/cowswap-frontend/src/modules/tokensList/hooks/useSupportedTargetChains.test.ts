import { AdditionalTargetChainId, ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { useSupportedTargetChains } from './useSupportedTargetChains'

import { mapChainInfo } from '../utils/mapChainInfo'

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
}))

jest.mock('../utils/mapChainInfo', () => ({
  mapChainInfo: jest.fn((id: number) => ({ id, label: `Chain ${id}` }) as unknown as ChainInfo),
}))

const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>

describe('useSupportedTargetChains', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(mapChainInfo as jest.Mock).mockImplementation((id) => ({ id, label: `Chain ${id}` }) as unknown as ChainInfo)
    mockUseFlags.mockReturnValue({ isInkEnabled: true, isBtcBridgeEnabled: false, isSolBridgeEnabled: false })
  })

  it('excludes BTC and Solana when both flags are disabled', () => {
    const { result } = renderHook(() => useSupportedTargetChains())

    const ids = result.current.map((c) => c.id)
    expect(ids).not.toContain(AdditionalTargetChainId.BITCOIN)
    expect(ids).not.toContain(AdditionalTargetChainId.SOLANA)
  })

  it('includes BTC when isBtcBridgeEnabled is true', () => {
    mockUseFlags.mockReturnValue({ isInkEnabled: true, isBtcBridgeEnabled: true, isSolBridgeEnabled: false })

    const { result } = renderHook(() => useSupportedTargetChains())

    const ids = result.current.map((c) => c.id)
    expect(ids).toContain(AdditionalTargetChainId.BITCOIN)
    expect(ids).not.toContain(AdditionalTargetChainId.SOLANA)
  })

  it('includes Solana when isSolBridgeEnabled is true', () => {
    mockUseFlags.mockReturnValue({ isInkEnabled: true, isBtcBridgeEnabled: false, isSolBridgeEnabled: true })

    const { result } = renderHook(() => useSupportedTargetChains())

    const ids = result.current.map((c) => c.id)
    expect(ids).toContain(AdditionalTargetChainId.SOLANA)
    expect(ids).not.toContain(AdditionalTargetChainId.BITCOIN)
  })

  it('includes both BTC and Solana when both flags are enabled', () => {
    mockUseFlags.mockReturnValue({ isInkEnabled: true, isBtcBridgeEnabled: true, isSolBridgeEnabled: true })

    const { result } = renderHook(() => useSupportedTargetChains())

    const ids = result.current.map((c) => c.id)
    expect(ids).toContain(AdditionalTargetChainId.BITCOIN)
    expect(ids).toContain(AdditionalTargetChainId.SOLANA)
  })

  it('always includes EVM supported chains', () => {
    mockUseFlags.mockReturnValue({ isInkEnabled: true, isBtcBridgeEnabled: false, isSolBridgeEnabled: false })

    const { result } = renderHook(() => useSupportedTargetChains())

    const ids = result.current.map((c) => c.id)
    expect(ids).toContain(SupportedChainId.MAINNET)
    expect(ids).toContain(SupportedChainId.GNOSIS_CHAIN)
  })

  it('excludes INK when isInkEnabled is false', () => {
    mockUseFlags.mockReturnValue({ isInkEnabled: false, isBtcBridgeEnabled: true, isSolBridgeEnabled: true })

    const { result } = renderHook(() => useSupportedTargetChains())

    const ids = result.current.map((c) => c.id)
    expect(ids).not.toContain(SupportedChainId.INK)
    expect(ids).toContain(AdditionalTargetChainId.BITCOIN)
    expect(ids).toContain(AdditionalTargetChainId.SOLANA)
  })
})
