import { SolverDeployment } from '../../utils/fetchSolversInfo'

export function formatWebsiteUrl(url: string): string {
  try {
    const { hostname } = new URL(url)
    return hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export type SummaryNetwork = {
  chainId: number
  chainName: string
}

export function mapSummaryNetworks(deployments: SolverDeployment[]): SummaryNetwork[] {
  const byChainId = new Map<number, string>()

  deployments.forEach((deployment) => {
    byChainId.set(deployment.chainId, deployment.chainName)
  })

  return [...byChainId.entries()]
    .map(([chainId, chainName]) => ({ chainId, chainName }))
    .sort((a, b) => a.chainName.localeCompare(b.chainName))
}

export function mapSummaryEnvironments(deployments: SolverDeployment[]): string[] {
  const environments = new Set<string>()

  deployments.forEach((deployment) => {
    if (deployment.environment) {
      environments.add(deployment.environment)
    }
  })

  return [...environments].sort()
}
