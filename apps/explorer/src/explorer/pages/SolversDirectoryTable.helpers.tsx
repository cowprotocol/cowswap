import React from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ExternalLink } from '@cowprotocol/ui'

import { Placeholder } from './Solvers.styles'
import {
  DeploymentsPanelTitle,
  DeploymentsGridHeader,
  DeploymentsGridRow,
  DeploymentsPanel,
  EnvTag,
  EnvTags,
  ExpandButton,
  Mono,
  NetworkChip,
  NetworkIcon,
  Networks,
  SolverCell,
  SolverDetails,
  SolverId,
  SolverLogo,
  SolverLogoFallback,
} from './SolversDirectoryTable.styles'

import { AddressLink } from '../../components/common/AddressLink'
import { SolverDeployment, SolverInfo } from '../../utils/fetchSolversInfo'

export const ALL_FILTER = 'all'
export const ACTIVE_FILTER_ACTIVE = 'active'
export const ACTIVE_FILTER_INACTIVE = 'inactive'

function getChainIcon(chainId: number): string | undefined {
  return CHAIN_INFO[chainId as SupportedChainId]?.logo?.light || undefined
}

function solverIconNode(solver: SolverInfo): React.ReactNode {
  if (solver.image) return <SolverLogo src={solver.image} alt={`${solver.displayName} logo`} />
  return <SolverLogoFallback>{solver.displayName.charAt(0).toUpperCase()}</SolverLogoFallback>
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

function networkChipsNode(solver: SolverInfo): React.ReactNode {
  return (
    <Networks>
      {solver.networks.map((network) => {
        const chainIcon = getChainIcon(network.chainId)
        return (
          <NetworkChip key={`${solver.solverId}-${network.chainId}`}>
            {chainIcon && <NetworkIcon src={chainIcon} alt="" />}
            {network.chainName}
          </NetworkChip>
        )
      })}
    </Networks>
  )
}

function environmentTagsNode(solver: SolverInfo): React.ReactNode {
  const environments = new Set<string>()

  solver.networks.forEach((network) => network.environments.forEach((environment) => environments.add(environment)))

  return (
    <EnvTags>
      {[...environments].sort().map((environment) => (
        <EnvTag key={`${solver.solverId}-${environment}`} $environment={environment}>
          {environment}
        </EnvTag>
      ))}
    </EnvTags>
  )
}

function summaryRowNode(
  solver: SolverInfo,
  isExpanded: boolean,
  onToggle: (solverId: string) => void,
  key: string,
): React.ReactNode {
  return (
    <tr key={key}>
      <td className="solver">
        <SolverCell>
          <ExpandButton onClick={(): void => onToggle(solver.solverId)} aria-label="Toggle deployments">
            {isExpanded ? '▾' : '▸'}
          </ExpandButton>
          {solverIconNode(solver)}
          <SolverDetails>
            <span>{solver.displayName}</span>
            <SolverId>{solver.solverId}</SolverId>
          </SolverDetails>
        </SolverCell>
      </td>
      <td className="networks">{networkChipsNode(solver)}</td>
      <td className="envs">{environmentTagsNode(solver)}</td>
      <td className="website">
        {solver.website ? (
          <ExternalLink href={solver.website} target="_blank">
            Website
          </ExternalLink>
        ) : (
          <Placeholder>-</Placeholder>
        )}
      </td>
      <td className="description">{solver.description || <Placeholder>-</Placeholder>}</td>
    </tr>
  )
}

function detailsRowNode(solver: SolverInfo, deployments: SolverDeployment[], key: string): React.ReactNode {
  return (
    <tr key={key}>
      <td colSpan={5}>
        <DeploymentsPanel>
          <DeploymentsPanelTitle>Solver and payout addresses by chain/environment</DeploymentsPanelTitle>
          <DeploymentsGridHeader>
            <span>Chain</span>
            <span>Env</span>
            <span>Solver address</span>
            <span>Payout address</span>
            <span>Active</span>
          </DeploymentsGridHeader>
          {deployments.map((deployment, index) => (
            <DeploymentsGridRow
              key={`${solver.solverId}-${deployment.chainId}-${deployment.environment || 'na'}-${deployment.address || 'na'}-${deployment.payoutAddress || 'na'}-${deployment.active ? 'active' : 'inactive'}-${index}`}
            >
              <span>{deployment.chainName}</span>
              <span>{deployment.environment || '-'}</span>
              {deployment.address ? (
                <AddressLink
                  address={deployment.address}
                  chainId={deployment.chainId}
                  showIcon
                  showNetworkName={false}
                />
              ) : (
                <Mono>-</Mono>
              )}
              {deployment.payoutAddress ? (
                <AddressLink
                  address={deployment.payoutAddress}
                  chainId={deployment.chainId}
                  showIcon
                  showNetworkName={false}
                />
              ) : (
                <Mono>-</Mono>
              )}
              <span>{deployment.active ? 'Yes' : 'No'}</span>
            </DeploymentsGridRow>
          ))}
        </DeploymentsPanel>
      </td>
    </tr>
  )
}

export function buildBodyRows(
  solvers: SolverInfo[],
  expandedRows: Record<string, boolean>,
  networkFilter: string,
  environmentFilter: string,
  onToggle: (solverId: string) => void,
): React.ReactNode {
  if (!solvers.length) {
    return (
      <tr>
        <td colSpan={5}>
          <Placeholder>No solvers match your current filters.</Placeholder>
        </td>
      </tr>
    )
  }

  return solvers.flatMap((solver) => {
    const isExpanded = !!expandedRows[solver.solverId]
    const deployments = filterDeployments(solver.deployments, networkFilter, environmentFilter)
    const summary = summaryRowNode(solver, isExpanded, onToggle, solver.solverId)

    if (!isExpanded) return [summary]
    const details = detailsRowNode(solver, deployments, `${solver.solverId}-details`)

    return [summary, details]
  })
}
