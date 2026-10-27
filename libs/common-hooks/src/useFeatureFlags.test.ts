import { createStore, Provider } from 'jotai'
import { createElement, ReactNode } from 'react'

import { renderHook } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { alphaNetworksEnabledAtom, useFeatureFlags } from './useFeatureFlags'

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
}))

const mockUseFlags = jest.mocked(useFlags)

const LD_FLAGS = { isSolanaEnabled: true, isSolBridgeEnabled: true, isTwapEoaEnabled: true }

describe('useFeatureFlags', () => {
  beforeEach(() => {
    mockUseFlags.mockReturnValue(LD_FLAGS)
  })

  afterEach(() => {
    window.location.hash = ''
  })

  it('returns LaunchDarkly flags as is outside the widget', () => {
    const { result } = renderHook(() => useFeatureFlags())

    expect(result.current).toEqual(LD_FLAGS)
  })

  it('forces Solana off inside the widget and keeps the rest, including bridging to Solana', () => {
    window.location.hash = '#/1/widget/swap'

    const { result } = renderHook(() => useFeatureFlags())

    expect(result.current).toEqual({ isSolanaEnabled: false, isSolBridgeEnabled: true, isTwapEoaEnabled: true })
  })

  it.each`
    isSolanaEnabled | isAlphaNetworksOptionVisible | optedIn  | expected
    ${true}         | ${false}                     | ${false} | ${true}
    ${true}         | ${true}                      | ${false} | ${true}
    ${false}        | ${true}                      | ${false} | ${false}
    ${false}        | ${true}                      | ${true}  | ${true}
    ${false}        | ${false}                     | ${true}  | ${false}
  `(
    'resolves isSolanaEnabled to $expected (flag $isSolanaEnabled, option visible $isAlphaNetworksOptionVisible, opted in $optedIn)',
    ({ isSolanaEnabled, isAlphaNetworksOptionVisible, optedIn, expected }) => {
      mockUseFlags.mockReturnValue({ isSolanaEnabled, isAlphaNetworksOptionVisible })
      const store = createStore()
      store.set(alphaNetworksEnabledAtom, optedIn)
      const wrapper = ({ children }: { children: ReactNode }): ReactNode => createElement(Provider, { store }, children)

      const { result } = renderHook(() => useFeatureFlags(), { wrapper })

      expect(result.current.isSolanaEnabled).toBe(expected)
    },
  )
})
