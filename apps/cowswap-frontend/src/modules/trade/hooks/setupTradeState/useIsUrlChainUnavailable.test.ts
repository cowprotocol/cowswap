import { createStore, Provider } from 'jotai'
import { createElement, ReactNode } from 'react'

import { useAvailableChains } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'

import { FeatureFlagsStatus, featureFlagsStatusAtom } from 'common/state/featureFlagsState'

import { useIsUrlChainUnavailable } from './useIsUrlChainUnavailable'

jest.mock('@cowprotocol/common-hooks', () => ({
  ...jest.requireActual('@cowprotocol/common-hooks'),
  useAvailableChains: jest.fn(),
}))

jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  isInjectedWidget: jest.fn(),
}))

const mockUseAvailableChains = jest.mocked(useAvailableChains)
const mockIsInjectedWidget = jest.mocked(isInjectedWidget)

function renderWithStatus(chainId: number | null, status: FeatureFlagsStatus): boolean {
  const store = createStore()
  store.set(featureFlagsStatusAtom, status)

  const wrapper = ({ children }: { children: ReactNode }): ReactNode => createElement(Provider, { store }, children)

  return renderHook(() => useIsUrlChainUnavailable(chainId), { wrapper }).result.current
}

describe('useIsUrlChainUnavailable', () => {
  beforeEach(() => {
    mockUseAvailableChains.mockReturnValue([SupportedChainId.MAINNET, SupportedChainId.GNOSIS_CHAIN])
    mockIsInjectedWidget.mockReturnValue(false)
  })

  it('returns false for an available chain', () => {
    expect(renderWithStatus(SupportedChainId.GNOSIS_CHAIN, 'ready')).toBe(false)
  })

  it('returns false when the URL has no chain', () => {
    expect(renderWithStatus(null, 'ready')).toBe(false)
  })

  it('returns true for an unavailable chain once feature flags are resolved', () => {
    expect(renderWithStatus(SupportedChainId.SOLANA, 'ready')).toBe(true)
    expect(renderWithStatus(SupportedChainId.SOLANA, 'unavailable')).toBe(true)
  })

  it('does not treat a chain as unavailable in the app while feature flags are loading', () => {
    expect(renderWithStatus(SupportedChainId.SOLANA, 'loading')).toBe(false)
  })

  it('treats an unavailable chain as unavailable in the widget even while feature flags are loading', () => {
    mockIsInjectedWidget.mockReturnValue(true)

    expect(renderWithStatus(SupportedChainId.SOLANA, 'loading')).toBe(true)
  })
})
