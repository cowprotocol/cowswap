import { Provider } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'

import { useBlockNumber } from './useBlockNumber'

import { blockNumberByChainIdAtom } from '../state/blockNumberAtom'

let mockChainId: number = SupportedChainId.MAINNET

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: () => ({ chainId: mockChainId }),
}))

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

function wrapper(state: Record<number, number>) {
  return function Wrapper({ children }: { children: ReactNode }): ReactNode {
    return (
      <Provider>
        <HydrateAtoms initialValues={[[blockNumberByChainIdAtom, state]] as never}>{children}</HydrateAtoms>
      </Provider>
    )
  }
}

describe('useBlockNumber', () => {
  it('returns the latest block number for the active chain', () => {
    mockChainId = SupportedChainId.MAINNET
    const { result } = renderHook(() => useBlockNumber(), {
      wrapper: wrapper({ [SupportedChainId.MAINNET]: 123, [SupportedChainId.POLYGON]: 5 }),
    })

    expect(result.current).toBe(123)
  })

  it('returns undefined when there is no block number for the active chain', () => {
    mockChainId = SupportedChainId.POLYGON
    const { result } = renderHook(() => useBlockNumber(), {
      wrapper: wrapper({ [SupportedChainId.MAINNET]: 123 }),
    })

    expect(result.current).toBeUndefined()
  })
})
