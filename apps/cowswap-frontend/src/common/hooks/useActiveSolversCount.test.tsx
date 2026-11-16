import { createStore, Provider } from 'jotai'
import { ReactNode } from 'react'

import { SolversInfo, solversInfoAtom } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'

import { useActiveSolversCount } from './useActiveSolversCount'

const SOLVERS_INFO: SolversInfo = [
  {
    solverId: 'grafiks',
    displayName: 'Grafiks',
    isActive: true,
    solverNetworks: [
      { chainId: SupportedChainId.MAINNET, env: 'prod', address: '0x1111' },
      { chainId: SupportedChainId.MAINNET, env: 'prod', address: '0x2222' },
      { chainId: SupportedChainId.ARBITRUM_ONE, env: 'prod', address: '0x3333' },
    ],
  },
  {
    solverId: 'fractal',
    displayName: 'Fractal',
    isActive: false,
    solverNetworks: [{ chainId: SupportedChainId.MAINNET, env: 'prod', address: '0x4444' }],
  },
  {
    solverId: 'asao',
    displayName: 'Asao',
    isActive: true,
    solverNetworks: [{ chainId: SupportedChainId.MAINNET, env: 'staging', address: '0x5555' }],
  },
]

function renderCount(chainId: SupportedChainId, solversInfo: SolversInfo = SOLVERS_INFO): number {
  const store = createStore()
  store.set(solversInfoAtom, solversInfo)

  const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>

  return renderHook(() => useActiveSolversCount(chainId), { wrapper }).result.current
}

describe('useActiveSolversCount', () => {
  // Grafiks has two mainnet deployments, Fractal is deactivated, Asao is on another env
  it('counts each solver once and leaves out deactivated solvers and other envs', () => {
    expect(renderCount(SupportedChainId.MAINNET)).toBe(1)
  })

  it('counts per chain', () => {
    expect(renderCount(SupportedChainId.ARBITRUM_ONE)).toBe(1)
    expect(renderCount(SupportedChainId.BASE)).toBe(0)
  })

  // Info persisted before `isActive` existed stays usable until the CMS request resolves
  it('counts solvers persisted without the flag', () => {
    const legacyInfo: SolversInfo = [
      {
        solverId: 'grafiks',
        displayName: 'Grafiks',
        solverNetworks: [{ chainId: SupportedChainId.MAINNET, env: 'prod', address: '0x1111' }],
      },
    ]

    expect(renderCount(SupportedChainId.MAINNET, legacyInfo)).toBe(1)
  })
})
