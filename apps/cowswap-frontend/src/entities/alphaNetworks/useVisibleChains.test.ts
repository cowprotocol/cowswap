import { createStore, Provider } from 'jotai'
import { createElement, ReactNode } from 'react'

import { useAvailableChains } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'

import { alphaNetworksEnabledAtom } from './state/alphaNetworksEnabledAtom'
import { useVisibleChains } from './useVisibleChains'

// The real list is empty between slow releases, so the opt-in is exercised against a stand-in.
jest.mock('./const', () => ({
  ALPHA_NETWORK_IDS: [jest.requireActual('@cowprotocol/cow-sdk').SupportedChainId.SOLANA],
}))

jest.mock('@cowprotocol/common-hooks', () => ({
  useAvailableChains: jest.fn(),
}))

const mockUseAvailableChains = jest.mocked(useAvailableChains)

function renderVisibleChains(areAlphaNetworksEnabled: boolean): SupportedChainId[] {
  const store = createStore()
  store.set(alphaNetworksEnabledAtom, areAlphaNetworksEnabled)
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => createElement(Provider, { store }, children)

  return renderHook(() => useVisibleChains(), { wrapper }).result.current
}

describe('useVisibleChains', () => {
  beforeEach(() => {
    mockUseAvailableChains.mockReturnValue([SupportedChainId.MAINNET, SupportedChainId.SOLANA])
  })

  it('hides an alpha network until the user opts in', () => {
    expect(renderVisibleChains(false)).toEqual([SupportedChainId.MAINNET])
  })

  it('shows an alpha network once the user opts in', () => {
    expect(renderVisibleChains(true)).toEqual([SupportedChainId.MAINNET, SupportedChainId.SOLANA])
  })
})
