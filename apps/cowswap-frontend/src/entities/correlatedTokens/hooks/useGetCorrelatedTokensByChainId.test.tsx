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

const ADDRESS_1 = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC

describe('useGetCorrelatedTokensByChainId', () => {
  it('should return token address normalized', async () => {
    const initialState = {
      [SupportedChainId.MAINNET]: [{ [ADDRESS_1]: 'TOKEN1' }],
    }

    const { result } = renderHook(() => useGetCorrelatedTokensByChainId(), {
      wrapper: ({ children }) => <TestProvider initialState={initialState}>{children}</TestProvider>,
    })

    const tokens = await result.current(SupportedChainId.MAINNET)
    expect(tokens).toEqual([ADDRESS_1.toLowerCase()])
  })

  it('should normalize checksummed addresses consistently', async () => {
    // ADDRESS_1 is already EIP-55 checksummed (mixed case), verify it normalizes to lowercase
    const initialState = {
      [SupportedChainId.MAINNET]: [{ [ADDRESS_1]: 'TOKEN1' }],
    }

    const { result } = renderHook(() => useGetCorrelatedTokensByChainId(), {
      wrapper: ({ children }) => <TestProvider initialState={initialState}>{children}</TestProvider>,
    })

    const tokens = await result.current(SupportedChainId.MAINNET)
    expect(tokens).toEqual([ADDRESS_1.toLowerCase()])
  })

  it('should remove duplicate addresses', async () => {
    const initialState = {
      [SupportedChainId.MAINNET]: [{ [ADDRESS_1]: 'TOKEN1' }, { [ADDRESS_1]: 'TOKEN1' }, { [ADDRESS_1]: 'TOKEN1' }],
    }

    const { result } = renderHook(() => useGetCorrelatedTokensByChainId(), {
      wrapper: ({ children }) => <TestProvider initialState={initialState}>{children}</TestProvider>,
    })

    const tokens = await result.current(SupportedChainId.MAINNET)
    expect(tokens).toHaveLength(1)
    expect(tokens).toEqual([ADDRESS_1.toLowerCase()])
  })
})
