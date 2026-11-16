import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { mapCmsSolversInfoToSolversInfo } from './mapCmsSolversInfoToSolversInfo'

import { CmsSolversInfo } from '../types'

interface SolverNetworkFixture {
  active?: boolean
  address: string
  chainId: number
  environment: string
}

function buildCmsSolver(
  id: number,
  attributes: { solverId: string; displayName: string; active?: boolean; networks: SolverNetworkFixture[] },
): CmsSolversInfo[number] {
  const { solverId, displayName, active, networks } = attributes

  return {
    id,
    attributes: {
      solverId,
      displayName,
      active,
      solver_networks: {
        data: networks.map((network, index) => ({
          id: id * 100 + index,
          attributes: {
            active: network.active,
            address: network.address,
            network: { data: { id: network.chainId, attributes: { chainId: network.chainId } } },
            environment: { data: { id: index, attributes: { name: network.environment } } },
          },
        })),
      },
    },
  } as unknown as CmsSolversInfo[number]
}

const SOLANA_ADDRESS = '3jHwQjfsALASmqvFmBo5hJJSL5ywmWtfC9EfKE1cE9be'

describe('mapCmsSolversInfoToSolversInfo', () => {
  // A dagster job flips solver-level `active` to false for solvers that only settle on Solana;
  // dropping them leaves the progress bar rendering the raw settlement address
  it('keeps solvers flagged as inactive at the solver level', () => {
    const result = mapCmsSolversInfoToSolversInfo([
      buildCmsSolver(74, {
        solverId: 'grafiks',
        displayName: 'Grafiks',
        active: false,
        networks: [{ active: true, address: SOLANA_ADDRESS, chainId: 1000000001, environment: 'prod' }],
      }),
    ])

    expect(result).toEqual([
      {
        solverId: 'grafiks',
        displayName: 'Grafiks',
        description: undefined,
        image: undefined,
        solverNetworks: [{ chainId: 1000000001, env: 'prod', address: SOLANA_ADDRESS, isActive: true }],
      },
    ])
  })

  it('maps the per-network active flag, defaulting to active when the CMS leaves it unset', () => {
    const result = mapCmsSolversInfoToSolversInfo([
      buildCmsSolver(1, {
        solverId: 'naive',
        displayName: 'Naive',
        networks: [
          { active: false, address: '0x1111111111111111111111111111111111111111', chainId: 1, environment: 'prod' },
          {
            address: '0x2222222222222222222222222222222222222222',
            chainId: SupportedChainId.ARBITRUM_ONE,
            environment: 'barn',
          },
        ],
      }),
    ])

    expect(result[0].solverNetworks).toEqual([
      { chainId: 1, env: 'prod', address: '0x1111111111111111111111111111111111111111', isActive: false },
      {
        chainId: SupportedChainId.ARBITRUM_ONE,
        env: 'staging',
        address: '0x2222222222222222222222222222222222222222',
        isActive: true,
      },
    ])
  })
})
