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
    solanaVersion | isAlphaNetworksOptionVisible | optedIn  | expected
    ${'beta'}     | ${false}                     | ${false} | ${true}
    ${'beta'}     | ${true}                      | ${false} | ${true}
    ${'ga'}       | ${true}                      | ${false} | ${true}
    ${'alpha'}    | ${true}                      | ${false} | ${false}
    ${'alpha'}    | ${true}                      | ${true}  | ${true}
    ${'alpha'}    | ${false}                     | ${true}  | ${false}
    ${undefined}  | ${true}                      | ${false} | ${false}
  `(
    'is $expected with solanaVersion $solanaVersion, option visible $isAlphaNetworksOptionVisible, opted in $optedIn',
    ({ solanaVersion, isAlphaNetworksOptionVisible, optedIn, expected }) => {
      mockUseFlags.mockReturnValue({ solanaVersion, isAlphaNetworksOptionVisible })
      const store = createStore()
      store.set(alphaNetworksEnabledAtom, optedIn)
      const wrapper = ({ children }: { children: ReactNode }): ReactNode => createElement(Provider, { store }, children)

      expect(renderHook(() => useIsSolanaVisible(), { wrapper }).result.current).toBe(expected)
    },
  )
})
