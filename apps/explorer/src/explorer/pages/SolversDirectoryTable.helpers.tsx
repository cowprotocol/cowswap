import { SolverDeployment, SolverInfo } from '../../utils/fetchSolversInfo'

export const ALL_FILTER = 'all'
export const ACTIVE_FILTER_ACTIVE = 'active'
export const ACTIVE_FILTER_INACTIVE = 'inactive'

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

export function filterDeploymentsByActiveStatus(
  deployments: SolverDeployment[],
  activeFilter: string,
): SolverDeployment[] {
  if (activeFilter === ALL_FILTER) {
    return deployments
  }
  if (activeFilter === ACTIVE_FILTER_ACTIVE) {
    return deployments.filter((deployment) => deployment.active)
  }
  if (activeFilter === ACTIVE_FILTER_INACTIVE) {
    return deployments.filter((deployment) => !deployment.active)
  }
  return deployments
}

export function getNetworkOptions(solversInfo: SolverInfo[]): [number, string][] {
  const entries = new Map<number, string>()

  solversInfo.forEach((solver) => {
    solver.deployments.forEach((deployment) => {
      entries.set(deployment.chainId, deployment.chainName)
    })
  })

  return [...entries.entries()].sort((a, b) => a[1].localeCompare(b[1]))
}

export function getEnvironmentOptions(solversInfo: SolverInfo[]): string[] {
  const environments = new Set<string>()

  solversInfo.forEach((solver) => {
    solver.deployments.forEach((deployment) => {
      if (deployment.environment) {
        environments.add(deployment.environment)
      }
    })
  })

  return [...environments].sort()
}

export function filterSolvers(
  solversInfo: SolverInfo[],
  query: string,
  networkFilter: string,
  environmentFilter: string,
  activeFilter: string,
): SolverInfo[] {
  return solversInfo.filter((solver) => {
    const scopedDeployments = filterDeployments(solver.deployments, networkFilter, environmentFilter)
    const visibleDeployments = filterDeploymentsByActiveStatus(scopedDeployments, activeFilter)

    return visibleDeployments.length > 0 && matchesSearch(solver, query, visibleDeployments)
  })
}

function matchesSearch(solver: SolverInfo, query: string, deployments: SolverDeployment[]): boolean {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  const searchableFields = [
    solver.displayName,
    solver.solverId,
    solver.description || '',
    solver.website || '',
    deployments.map((deployment) => `${deployment.address || ''} ${deployment.payoutAddress || ''}`).join(' '),
  ]

  return searchableFields.join(' ').toLowerCase().includes(normalizedQuery)
}
