import { CHAIN_INFO } from '@cowprotocol/common-const'
import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { useSupportedChains } from './useSupportedChains'

import { mapChainInfo } from '../utils/mapChainInfo'

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
}))

jest.mock('../utils/mapChainInfo', () => ({
  mapChainInfo: jest.fn((id: number) => ({ id, label: `Chain ${id}` }) as unknown as ChainInfo),
}))

const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>
const mockMapChainInfo = mapChainInfo as jest.MockedFunction<typeof mapChainInfo>

describe('useSupportedChains', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockMapChainInfo.mockImplementation((id) => ({ id, label: `Chain ${id}` }) as unknown as ChainInfo)
    mockUseFlags.mockReturnValue({ isInkEnabled: true })
  })

  it('returns ChainInfo for all available chains', () => {
    const { result } = renderHook(() => useSupportedChains())

    expect(result.current.length).toBeGreaterThan(0)
    result.current.forEach((chain) => {
      expect(chain.id in SupportedChainId).toBe(true)
    })
  })

  it('calls mapChainInfo with correct chainId and CHAIN_INFO entry', () => {
    renderHook(() => useSupportedChains())

    expect(mockMapChainInfo).toHaveBeenCalledWith(SupportedChainId.MAINNET, CHAIN_INFO[SupportedChainId.MAINNET])
  })

  it('excludes INK when isInkEnabled is false', () => {
    mockUseFlags.mockReturnValue({ isInkEnabled: false })

    const { result } = renderHook(() => useSupportedChains())

    expect(result.current.map((c) => c.id)).not.toContain(SupportedChainId.INK)
  })

  it('includes INK when isInkEnabled is true', () => {
    mockUseFlags.mockReturnValue({ isInkEnabled: true })

    const { result } = renderHook(() => useSupportedChains())

    expect(result.current.map((c) => c.id)).toContain(SupportedChainId.INK)
  })
})
