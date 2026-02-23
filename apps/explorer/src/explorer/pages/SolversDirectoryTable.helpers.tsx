import { SolverDeployment, SolverInfo } from '../../utils/fetchSolversInfo'

export const ALL_FILTER = 'all'

function matchesSearch(solver: SolverInfo, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  const searchableFields = [
    solver.displayName,
    solver.solverId,
    solver.description || '',
    solver.website || '',
    solver.deployments.map((deployment) => `${deployment.address || ''} ${deployment.payoutAddress || ''}`).join(' '),
  ]

  return searchableFields.join(' ').toLowerCase().includes(normalizedQuery)
}

export function filterDeployments(
  deployments: SolverDeployment[],
  networkFilter: string,
  environmentFilter: string,
): SolverDeployment[] {
  return deployments.filter((deployment) => {
    const isNetworkMatch = networkFilter === ALL_FILTER || String(deployment.chainId) === networkFilter
    const isEnvironmentMatch = environmentFilter === ALL_FILTER || deployment.environment === environmentFilter
    return isNetworkMatch && isEnvironmentMatch
  })
}

export function getNetworkOptions(solversInfo: SolverInfo[]): [number, string][] {
  const entries = new Map<number, string>()

  solversInfo.forEach((solver) => {
    solver.networks.forEach((network) => {
      entries.set(network.chainId, network.chainName)
    })
  })

  return [...entries.entries()].sort((a, b) => a[1].localeCompare(b[1]))
}

export function getEnvironmentOptions(solversInfo: SolverInfo[]): string[] {
  const environments = new Set<string>()

  solversInfo.forEach((solver) => {
    solver.networks.forEach((network) => {
      network.environments.forEach((environment) => {
        environments.add(environment)
      })
    })
  })

  return [...environments].sort()
}

export function filterSolvers(
  solversInfo: SolverInfo[],
  query: string,
  networkFilter: string,
  environmentFilter: string,
): SolverInfo[] {
  return solversInfo.filter((solver) => {
    const isNetworkMatch =
      networkFilter === ALL_FILTER || solver.networks.some((network) => String(network.chainId) === networkFilter)
    const isEnvironmentMatch =
      environmentFilter === ALL_FILTER ||
      solver.networks.some((network) => network.environments.includes(environmentFilter))

    return isNetworkMatch && isEnvironmentMatch && matchesSearch(solver, query)
  })
}
