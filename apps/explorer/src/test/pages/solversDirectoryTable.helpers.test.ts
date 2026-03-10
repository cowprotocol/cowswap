import {
  ACTIVE_FILTER_ACTIVE,
  ACTIVE_FILTER_INACTIVE,
  ALL_FILTER,
  filterDeploymentsByActiveStatus,
  filterSolvers,
  getEnvironmentOptions,
  getNetworkOptions,
} from '../../explorer/pages/SolversDirectoryTable.helpers'
import { SolversInfo } from '../../utils/fetchSolversInfo'

const SOLVERS_INFO: SolversInfo = [
  {
    solverId: 'alpha',
    displayName: 'Alpha',
    networks: [{ chainId: 1, chainName: 'Ethereum', environments: ['prod', 'barn'] }],
    deployments: [
      {
        chainId: 1,
        chainName: 'Ethereum',
        environment: 'prod',
        address: '0xalpha1',
        active: true,
      },
      {
        chainId: 1,
        chainName: 'Ethereum',
        environment: 'barn',
        address: '0xalpha2',
        active: false,
      },
    ],
  },
  {
    solverId: 'beta',
    displayName: 'Beta',
    networks: [{ chainId: 1, chainName: 'Ethereum', environments: ['prod'] }],
    deployments: [
      {
        chainId: 1,
        chainName: 'Ethereum',
        environment: 'prod',
        address: '0xbeta1',
        active: false,
      },
    ],
  },
  {
    solverId: 'gamma',
    displayName: 'Gamma',
    networks: [{ chainId: 8453, chainName: 'Base', environments: ['prod'] }],
    deployments: [
      {
        chainId: 8453,
        chainName: 'Base',
        environment: 'prod',
        address: '0xgamma1',
        active: true,
      },
    ],
  },
  {
    solverId: 'delta',
    displayName: 'Delta',
    networks: [],
    deployments: [
      {
        chainId: 10,
        chainName: 'Optimism',
        environment: 'barn',
        address: '0xdelta1',
        active: false,
      },
      {
        chainId: 10,
        chainName: 'Optimism',
        environment: 'qa',
        address: '0xdelta2',
        active: false,
      },
    ],
  },
]

describe('SolversDirectoryTable helpers', () => {
  it('returns all matching solvers when status filter is All', () => {
    const result = filterSolvers(SOLVERS_INFO, '', ALL_FILTER, ALL_FILTER, ALL_FILTER)

    expect(result.map((solver) => solver.solverId)).toEqual(['alpha', 'beta', 'gamma', 'delta'])
  })

  it('returns only solvers with at least one active deployment when status filter is Active only', () => {
    const result = filterSolvers(SOLVERS_INFO, '', ALL_FILTER, ALL_FILTER, ACTIVE_FILTER_ACTIVE)

    expect(result.map((solver) => solver.solverId)).toEqual(['alpha', 'gamma'])
  })

  it('returns only solvers with at least one inactive deployment when status filter is Inactive only', () => {
    const result = filterSolvers(SOLVERS_INFO, '', ALL_FILTER, ALL_FILTER, ACTIVE_FILTER_INACTIVE)

    expect(result.map((solver) => solver.solverId)).toEqual(['alpha', 'beta', 'delta'])
  })

  it('applies active filter after network/environment scope', () => {
    const result = filterSolvers(SOLVERS_INFO, '', '8453', 'prod', ACTIVE_FILTER_INACTIVE)

    expect(result).toEqual([])
  })

  it('does not match addresses from inactive deployments', () => {
    const result = filterSolvers(SOLVERS_INFO, '0xalpha2', ALL_FILTER, ALL_FILTER, ACTIVE_FILTER_ACTIVE)

    expect(result).toEqual([])
  })

  it('matches addresses from active deployments', () => {
    const result = filterSolvers(SOLVERS_INFO, '0xalpha1', ALL_FILTER, ALL_FILTER, ACTIVE_FILTER_ACTIVE)

    expect(result.map((solver) => solver.solverId)).toEqual(['alpha'])
  })

  it('filters deployment rows strictly for Active', () => {
    const deployments = SOLVERS_INFO[0].deployments
    const result = filterDeploymentsByActiveStatus(deployments, ACTIVE_FILTER_ACTIVE)

    expect(result).toHaveLength(1)
    expect(result[0].active).toBe(true)
  })

  it('filters deployment rows strictly for Inactive', () => {
    const deployments = SOLVERS_INFO[0].deployments
    const result = filterDeploymentsByActiveStatus(deployments, ACTIVE_FILTER_INACTIVE)

    expect(result).toHaveLength(1)
    expect(result[0].active).toBe(false)
  })

  it('includes networks that only exist on inactive deployments', () => {
    const result = getNetworkOptions(SOLVERS_INFO)

    expect(result).toEqual(
      expect.arrayContaining([
        [10, 'Optimism'],
        [8453, 'Base'],
      ]),
    )
  })

  it('includes environments that only exist on inactive deployments', () => {
    const result = getEnvironmentOptions(SOLVERS_INFO)

    expect(result).toEqual(expect.arrayContaining(['qa', 'prod']))
  })
})
