import { Provider, useAtomValue } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import React, { ReactNode } from 'react'

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { act, renderHook } from '@testing-library/react'

import { NativeTokenBalanceUpdater } from './NativeTokenBalanceUpdater'

import { useNativeTokenBalance } from '../hooks/useNativeTokenBalance'
import { balancesAtom, BalancesState, DEFAULT_BALANCES_STATE } from '../state/balancesAtom'

jest.mock('../hooks/useNativeTokenBalance', () => ({
  useNativeTokenBalance: jest.fn(),
}))

const mockUseNativeTokenBalance = jest.requireMock<{ useNativeTokenBalance: jest.Mock }>(
  '../hooks/useNativeTokenBalance',
).useNativeTokenBalance

const ACCOUNT = '0x1234567890123456789012345678901234567890'
const MAINNET_NATIVE_KEY = getAddressKey(NATIVE_CURRENCIES[SupportedChainId.MAINNET].address)

function HydrateAtoms({ children }: { children: ReactNode }): ReactNode {
  useHydrateAtoms([[balancesAtom, DEFAULT_BALANCES_STATE]])
  return <>{children}</>
}

function Wrapper({ children }: { children: ReactNode }): ReactNode {
  return (
    <Provider>
      <HydrateAtoms>{children}</HydrateAtoms>
    </Provider>
  )
}

function renderUpdater(account: string | undefined, chainId: SupportedChainId): { result: { current: BalancesState } } {
  return renderHook(
    () => {
      NativeTokenBalanceUpdater({ account, chainId })
      return useAtomValue(balancesAtom)
    },
    { wrapper: Wrapper },
  )
}

describe('NativeTokenBalanceUpdater', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseNativeTokenBalance.mockReturnValue({ data: undefined })
  })

  it('does not write to balancesAtom while the wagmi query has no data yet', () => {
    const { result } = renderUpdater(ACCOUNT, SupportedChainId.MAINNET)
    expect(result.current.values[MAINNET_NATIVE_KEY]).toBeUndefined()
  })

  it('writes the native balance into balancesAtom under the chain native address key', () => {
    mockUseNativeTokenBalance.mockReturnValue({ data: { value: 1234567890123456789n } })

    const { result } = renderUpdater(ACCOUNT, SupportedChainId.MAINNET)

    expect(result.current.values[MAINNET_NATIVE_KEY]).toBe(1234567890123456789n)
  })

  it('forwards account and chainId to useNativeTokenBalance', () => {
    renderUpdater(ACCOUNT, SupportedChainId.ARBITRUM_ONE)

    expect(useNativeTokenBalance).toHaveBeenCalledWith(ACCOUNT, SupportedChainId.ARBITRUM_ONE)
  })

  it('updates the stored balance when the wagmi query emits a new value', () => {
    mockUseNativeTokenBalance.mockReturnValue({ data: { value: 100n } })

    const { result, rerender } = renderUpdater(ACCOUNT, SupportedChainId.MAINNET)
    expect(result.current.values[MAINNET_NATIVE_KEY]).toBe(100n)

    act(() => {
      mockUseNativeTokenBalance.mockReturnValue({ data: { value: 500n } })
      rerender()
    })

    expect(result.current.values[MAINNET_NATIVE_KEY]).toBe(500n)
  })
})
