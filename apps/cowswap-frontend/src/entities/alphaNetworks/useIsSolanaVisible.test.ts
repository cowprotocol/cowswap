import { createStore, Provider } from 'jotai'
import { createElement, ReactNode } from 'react'

import { renderHook } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { alphaNetworksEnabledAtom } from './state/alphaNetworksEnabledAtom'
import { useIsSolanaVisible } from './useIsSolanaVisible'

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
}))

const mockUseFlags = jest.mocked(useFlags)

describe('useIsSolanaVisible', () => {
  it.each`
    isSolanaEnabled | isAlphaNetworksOptionVisible | isSolanaBeta | optedIn  | expected
    ${true}         | ${false}                     | ${false}     | ${false} | ${true}
    ${true}         | ${true}                      | ${false}     | ${false} | ${true}
    ${false}        | ${true}                      | ${false}     | ${false} | ${false}
    ${false}        | ${true}                      | ${false}     | ${true}  | ${true}
    ${false}        | ${false}                     | ${false}     | ${true}  | ${false}
    ${false}        | ${false}                     | ${true}      | ${false} | ${true}
    ${false}        | ${true}                      | ${true}      | ${false} | ${true}
  `(
    'is $expected with isSolanaEnabled $isSolanaEnabled, option visible $isAlphaNetworksOptionVisible, beta $isSolanaBeta, opted in $optedIn',
    ({ isSolanaEnabled, isAlphaNetworksOptionVisible, isSolanaBeta, optedIn, expected }) => {
      mockUseFlags.mockReturnValue({ isSolanaEnabled, isAlphaNetworksOptionVisible, isSolanaBeta })
      const store = createStore()
      store.set(alphaNetworksEnabledAtom, optedIn)
      const wrapper = ({ children }: { children: ReactNode }): ReactNode => createElement(Provider, { store }, children)

      expect(renderHook(() => useIsSolanaVisible(), { wrapper }).result.current).toBe(expected)
    },
  )
})
