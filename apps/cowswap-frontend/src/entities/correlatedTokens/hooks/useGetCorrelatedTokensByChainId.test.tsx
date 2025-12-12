import { Provider } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'

import { renderHook } from '@testing-library/react'

import { useGetCorrelatedTokensByChainId } from './useGetCorrelatedTokensByChainId'

import { correlatedTokensAtom, CorrelatedTokens } from '../state/correlatedTokensAtom'

// Helper component to hydrate atoms in tests
function HydrateAtoms({
  initialValues,
  children,
}: {
  initialValues: Parameters<typeof useHydrateAtoms>[0]
  children: ReactNode
}): ReactNode {
  useHydrateAtoms(initialValues)
  return children
}

function TestProvider({
  initialState,
  children,
}: {
  initialState: Partial<PersistentStateByChain<CorrelatedTokens[]>>
  children: ReactNode
}): ReactNode {
  const atomInitialValues = [[correlatedTokensAtom, initialState] as const]
  return (
    <Provider>
      <HydrateAtoms initialValues={atomInitialValues as never}>{children}</HydrateAtoms>
    </Provider>
  )
}

describe('useGetCorrelatedTokensByChainId', () => {
  it('should return token address in lowercase', async () => {
    const initialState = {
      [SupportedChainId.MAINNET]: [{ '0xABCDEF1234567890': 'TOKEN1' }],
    }

    const { result } = renderHook(() => useGetCorrelatedTokensByChainId(), {
      wrapper: ({ children }) => <TestProvider initialState={initialState}>{children}</TestProvider>,
    })

    const tokens = await result.current(SupportedChainId.MAINNET)
    expect(tokens).toEqual(['0xabcdef1234567890'])
  })

  it('should convert uppercase addresses to lowercase', async () => {
    const initialState = {
      [SupportedChainId.MAINNET]: [{ '0XABCDEF': 'TOKEN1' }],
    }

    const { result } = renderHook(() => useGetCorrelatedTokensByChainId(), {
      wrapper: ({ children }) => <TestProvider initialState={initialState}>{children}</TestProvider>,
    })

    const tokens = await result.current(SupportedChainId.MAINNET)
    expect(tokens).toEqual(['0xabcdef'])
  })

  it('should remove duplicate addresses', async () => {
    const initialState = {
      [SupportedChainId.MAINNET]: [{ '0xToken1': 'TOKEN1' }, { '0xToken1': 'TOKEN1' }, { '0xToken1': 'TOKEN1' }],
    }

    const { result } = renderHook(() => useGetCorrelatedTokensByChainId(), {
      wrapper: ({ children }) => <TestProvider initialState={initialState}>{children}</TestProvider>,
    })

    const tokens = await result.current(SupportedChainId.MAINNET)
    expect(tokens).toHaveLength(1)
    expect(tokens).toEqual(['0xtoken1'])
  })
})
