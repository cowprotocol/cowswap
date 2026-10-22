import { createStore, Provider } from 'jotai'
import { createElement, ReactNode } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'
import { alphaNetworksEnabledAtom } from 'entities/alphaNetworks'
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
    mockUseFlags.mockReturnValue({})
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

  it('hides Robinhood until isRobinhoodEnabled is on', () => {
    const ids = (): number[] => renderHook(() => useSupportedChains()).result.current.map(({ id }) => id)

    expect(ids()).not.toContain(SupportedChainId.ROBINHOOD)

    mockUseFlags.mockReturnValue({ isRobinhoodEnabled: true })

    expect(ids()).toContain(SupportedChainId.ROBINHOOD)
  })

  it('hides Solana until the user enables alpha networks, even with its flag on', () => {
    mockUseFlags.mockReturnValue({ isSolanaEnabled: true })
    const store = createStore()
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => createElement(Provider, { store }, children)
    const ids = (): number[] => renderHook(() => useSupportedChains(), { wrapper }).result.current.map(({ id }) => id)

    expect(ids()).not.toContain(SupportedChainId.SOLANA)

    store.set(alphaNetworksEnabledAtom, true)

    expect(ids()).toContain(SupportedChainId.SOLANA)
  })
})
