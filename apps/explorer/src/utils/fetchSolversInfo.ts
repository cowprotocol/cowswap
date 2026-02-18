import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import type {
  CmsEntity,
  CmsSolverAttributes,
  CmsSolverNetworkAttributes,
  CmsSolversResponse,
  CmsSolverWithRequiredFields,
  SolverDeployment,
  SolverInfo,
  SolverNetworkInfo,
  SolversInfo,
} from './fetchSolversInfo.types'

export type { SolverDeployment, SolverInfo, SolverNetworkInfo, SolversInfo } from './fetchSolversInfo.types'

const CMS_BASE_URL =
  process.env.REACT_APP_CMS_BASE_URL || process.env.NEXT_PUBLIC_CMS_BASE_URL || 'https://cms.cow.fi/api'
const CMS_ORIGIN = new URL(CMS_BASE_URL).origin
const SOLVERS_QUERY = [
  'fields[0]=solverId',
  'fields[1]=displayName',
  'fields[2]=description',
  'fields[3]=website',
  'fields[4]=active',
  'populate[image][fields][0]=url',
  'populate[solver_networks][fields][0]=active',
  'populate[solver_networks][fields][1]=address',
  'populate[solver_networks][fields][2]=payoutAddress',
  'populate[solver_networks][fields][3]=payout_address',
  'populate[solver_networks][populate][network][fields][0]=chainId',
  'populate[solver_networks][populate][environment][fields][0]=name',
  'pagination[pageSize]=200',
].join('&')
const SOLVERS_API_URL = `${CMS_BASE_URL}/solvers?${SOLVERS_QUERY}`

let solversInfoCache: SolversInfo | undefined

export async function fetchSolversInfo(network?: number): Promise<SolversInfo> {
  if (!solversInfoCache) {
    const response = await fetch(SOLVERS_API_URL)

    if (!response.ok) {
      const details = await response.text().catch(() => '')
      throw new Error(`Failed to fetch solvers info: [${response.status}] ${details}`)
    }

    const body = (await response.json()) as CmsSolversResponse
    solversInfoCache = mapCmsSolversToSolversInfo(body.data || [])
  }

  return filterSolversByNetwork(solversInfoCache, network)
}

function mapCmsSolversToSolversInfo(cmsSolvers: CmsEntity<CmsSolverAttributes>[]): SolversInfo {
  return cmsSolvers
    .map(mapCmsSolver)
    .filter(isDefined)
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
}

function mapSolverDeployments(entries: CmsEntity<CmsSolverNetworkAttributes>[]): SolverDeployment[] {
  return entries.map(mapSolverDeployment).filter(isDefined).sort(sortSolverDeployments)
}

function mapSolverNetworks(deployments: SolverDeployment[]): SolverNetworkInfo[] {
  const chainIdToEnvironments = new Map<number, Set<string>>()

  for (const deployment of deployments) {
    if (!deployment.active) {
      continue
    }

    const currentEnvironments = chainIdToEnvironments.get(deployment.chainId) || new Set<string>()
    if (deployment.environment) {
      currentEnvironments.add(deployment.environment)
    }
    chainIdToEnvironments.set(deployment.chainId, currentEnvironments)
  }

  return [...chainIdToEnvironments.entries()]
    .map(([chainId, environments]) => ({
      chainId,
      chainName: getChainName(chainId),
      environments: [...environments].sort(),
    }))
    .sort((a, b) => a.chainName.localeCompare(b.chainName))
}

function getChainName(chainId: number): string {
  return CHAIN_INFO[chainId as SupportedChainId]?.label || `Chain ${chainId}`
}

function normalizeCmsImageUrl(url?: string | null): string | undefined {
  if (!url) {
    return undefined
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  if (url.startsWith('/')) {
    return `${CMS_ORIGIN}${url}`
  }

  return `${CMS_ORIGIN}/${url}`
}

function filterSolversByNetwork(allSolvers: SolversInfo, network?: number): SolversInfo {
  if (!network) {
    return allSolvers
  }

  return allSolvers
    .map((solver) => {
      const deployments = solver.deployments.filter((deployment) => deployment.chainId === network)

      return {
        ...solver,
        deployments,
        networks: mapSolverNetworks(deployments),
      }
    })
    .filter((solver) => solver.deployments.length > 0)
}

function mapCmsSolver(solver: CmsEntity<CmsSolverAttributes>): SolverInfo | undefined {
  const attributes = solver.attributes

  if (!hasRequiredSolverFields(attributes)) {
    return undefined
  }

  const deployments = mapSolverDeployments(attributes.solver_networks?.data || [])
  const networks = mapSolverNetworks(deployments)

  if (!networks.length) {
    return undefined
  }

  return {
    solverId: attributes.solverId,
    displayName: attributes.displayName,
    description: attributes.description || undefined,
    website: attributes.website || undefined,
    image: normalizeCmsImageUrl(attributes.image?.data?.attributes?.url),
    networks,
    deployments,
  }
}

function hasRequiredSolverFields(attributes?: CmsSolverAttributes | null): attributes is CmsSolverWithRequiredFields {
  return !!attributes?.solverId && !!attributes.displayName && attributes.active !== false
}

function mapSolverDeployment(entry: CmsEntity<CmsSolverNetworkAttributes>): SolverDeployment | undefined {
  const attributes = entry.attributes
  const chainId = getChainId(attributes)

  if (!chainId) {
    return undefined
  }

  return {
    chainId,
    chainName: getChainName(chainId),
    environment: getEnvironmentName(attributes),
    address: getAddress(attributes),
    payoutAddress: getPayoutAddress(attributes),
    active: isDeploymentActive(attributes),
  }
}

function sortSolverDeployments(a: SolverDeployment, b: SolverDeployment): number {
  const byChain = a.chainName.localeCompare(b.chainName)
  if (byChain !== 0) return byChain

  const byEnvironment = (a.environment || '').localeCompare(b.environment || '')
  if (byEnvironment !== 0) return byEnvironment

  return (a.address || '').localeCompare(b.address || '')
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

function getChainId(attributes?: CmsSolverNetworkAttributes | null): number | undefined {
  return attributes?.network?.data?.attributes?.chainId || undefined
}

function getEnvironmentName(attributes?: CmsSolverNetworkAttributes | null): string | undefined {
  return attributes?.environment?.data?.attributes?.name || undefined
}

function getAddress(attributes?: CmsSolverNetworkAttributes | null): string | undefined {
  return attributes?.address || undefined
}

function getPayoutAddress(attributes?: CmsSolverNetworkAttributes | null): string | undefined {
  return attributes?.payoutAddress || attributes?.payout_address || undefined
}

function isDeploymentActive(attributes?: CmsSolverNetworkAttributes | null): boolean {
  return attributes?.active !== false
}
