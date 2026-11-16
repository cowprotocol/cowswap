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
    solverNetworks: [
      { chainId: SupportedChainId.MAINNET, env: 'prod', address: '0x1111', isActive: true },
      { chainId: SupportedChainId.MAINNET, env: 'prod', address: '0x2222', isActive: false },
      { chainId: SupportedChainId.ARBITRUM_ONE, env: 'prod', address: '0x3333', isActive: true },
    ],
  },
  {
    solverId: 'fractal',
    displayName: 'Fractal',
    solverNetworks: [{ chainId: SupportedChainId.MAINNET, env: 'prod', address: '0x4444', isActive: false }],
  },
  {
    solverId: 'asao',
    displayName: 'Asao',
    solverNetworks: [{ chainId: SupportedChainId.MAINNET, env: 'staging', address: '0x5555', isActive: true }],
  },
]

function renderCount(chainId: SupportedChainId, solversInfo: SolversInfo = SOLVERS_INFO): number {
  const store = createStore()
  store.set(solversInfoAtom, solversInfo)

  const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>

  return renderHook(() => useActiveSolversCount(chainId), { wrapper }).result.current
}

describe('useActiveSolversCount', () => {
  // Grafiks has two mainnet deployments, Fractal's only one is retired, Asao's is on another env
  it('counts each solver once and leaves out retired deployments and other envs', () => {
    expect(renderCount(SupportedChainId.MAINNET)).toBe(1)
  })

  it('counts per chain', () => {
    expect(renderCount(SupportedChainId.ARBITRUM_ONE)).toBe(1)
    expect(renderCount(SupportedChainId.BASE)).toBe(0)
  })

  // Info persisted before `isActive` existed stays usable until the CMS request resolves
  it('counts deployments persisted without the flag', () => {
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
