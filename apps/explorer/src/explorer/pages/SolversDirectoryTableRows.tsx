import React from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { ExternalLink } from '@cowprotocol/ui'

import { Placeholder } from './Solvers.styles'
import {
  DeploymentsEmpty,
  DeploymentsGridHeader,
  DeploymentsGridRow,
  DeploymentsPanel,
  DeploymentsSection,
  DeploymentsSectionTitle,
  DeploymentsPanelTitle,
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

type ChainInfoEntry = {
  logo?: {
    light?: string
  }
}

const CHAIN_INFO_BY_ID = CHAIN_INFO as Partial<Record<number, ChainInfoEntry>>

function getChainIcon(chainId: number): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(CHAIN_INFO_BY_ID, chainId)) {
    return undefined
  }

  return CHAIN_INFO_BY_ID[chainId]?.logo?.light || undefined
}

function SolverIcon({ solver }: { solver: SolverInfo }): React.ReactNode {
  if (solver.image) return <SolverLogo src={solver.image} alt={`${solver.displayName} logo`} />
  return <SolverLogoFallback>{solver.displayName.charAt(0).toUpperCase()}</SolverLogoFallback>
}

type SummaryNetwork = {
  chainId: number
  chainName: string
}

function mapSummaryNetworks(deployments: SolverDeployment[]): SummaryNetwork[] {
  const byChainId = new Map<number, string>()

  deployments.forEach((deployment) => {
    byChainId.set(deployment.chainId, deployment.chainName)
  })

  return [...byChainId.entries()]
    .map(([chainId, chainName]) => ({ chainId, chainName }))
    .sort((a, b) => a.chainName.localeCompare(b.chainName))
}

function mapSummaryEnvironments(deployments: SolverDeployment[]): string[] {
  const environments = new Set<string>()

  deployments.forEach((deployment) => {
    if (deployment.environment) {
      environments.add(deployment.environment)
    }
  })

  return [...environments].sort()
}

function NetworkChips({ solverId, networks }: { solverId: string; networks: SummaryNetwork[] }): React.ReactNode {
  return (
    <Networks>
      {networks.map((network) => {
        const chainIcon = getChainIcon(network.chainId)
        // Lens uses a black light logo, so we invert it to keep visibility on dark chips.
        const isLensNetwork = network.chainName.toLowerCase() === 'lens'
        return (
          <NetworkChip key={`${solverId}-${network.chainId}`}>
            {chainIcon && <NetworkIcon src={chainIcon} alt="" $invert={isLensNetwork} />}
            {network.chainName}
          </NetworkChip>
        )
      })}
    </Networks>
  )
}

function EnvironmentTags({ solverId, environments }: { solverId: string; environments: string[] }): React.ReactNode {
  return (
    <EnvTags>
      {environments.map((environment) => (
        <EnvTag key={`${solverId}-${environment}`} $environment={environment}>
          {environment}
        </EnvTag>
      ))}
    </EnvTags>
  )
}

type SolverSummaryRowProps = {
  solver: SolverInfo
  deployments: SolverDeployment[]
  isExpanded: boolean
  onToggle: (solverId: string) => void
}

export function SolverSummaryRow({
  solver,
  deployments,
  isExpanded,
  onToggle,
}: SolverSummaryRowProps): React.ReactNode {
  const toggleAriaLabel = `Toggle deployments for solver ${solver.displayName} (${solver.solverId})`
  const networks = mapSummaryNetworks(deployments)
  const environments = mapSummaryEnvironments(deployments)

  return (
    <tr>
      <td className="solver">
        <SolverCell>
          <ExpandButton
            onClick={(): void => onToggle(solver.solverId)}
            aria-expanded={isExpanded}
            aria-label={toggleAriaLabel}
          >
            {isExpanded ? '▾' : '▸'}
          </ExpandButton>
          <SolverIcon solver={solver} />
          <SolverDetails>
            <span>{solver.displayName}</span>
            <SolverId>{solver.solverId}</SolverId>
          </SolverDetails>
        </SolverCell>
      </td>
      <td className="networks">
        <NetworkChips solverId={solver.solverId} networks={networks} />
      </td>
      <td className="envs">
        <EnvironmentTags solverId={solver.solverId} environments={environments} />
      </td>
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

type SolverDetailsRowProps = {
  solver: SolverInfo
  deployments: SolverDeployment[]
}

type DeploymentsSectionRowsProps = {
  solver: SolverInfo
  deployments: SolverDeployment[]
}

function DeploymentsSectionRows({ solver, deployments }: DeploymentsSectionRowsProps): React.ReactNode {
  return (
    <>
      <DeploymentsGridHeader>
        <span>Chain</span>
        <span>Env</span>
        <span>Solver address</span>
        <span>Payout address</span>
      </DeploymentsGridHeader>
      {deployments.map((deployment, index) => (
        <DeploymentsGridRow key={`${solver.solverId}-${deployment.chainId}-${deployment.environment || 'na'}-${index}`}>
          <span>{deployment.chainName}</span>
          <span>{deployment.environment || '-'}</span>
          {deployment.address ? (
            <AddressLink address={deployment.address} chainId={deployment.chainId} showIcon showNetworkName={false} />
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
        </DeploymentsGridRow>
      ))}
    </>
  )
}

export function SolverDetailsRow({ solver, deployments }: SolverDetailsRowProps): React.ReactNode {
  const activeDeployments = deployments.filter((deployment) => deployment.active)
  const inactiveDeployments = deployments.filter((deployment) => !deployment.active)
  const hasActiveDeployments = activeDeployments.length > 0
  const hasInactiveDeployments = inactiveDeployments.length > 0
  const hasAnyDeployments = hasActiveDeployments || hasInactiveDeployments

  return (
    <tr>
      <td colSpan={5}>
        <DeploymentsPanel>
          <DeploymentsPanelTitle>Solver and payout addresses by chain/environment</DeploymentsPanelTitle>
          {hasAnyDeployments ? (
            <>
              {hasActiveDeployments && (
                <DeploymentsSection>
                  <DeploymentsSectionTitle>Active</DeploymentsSectionTitle>
                  <DeploymentsSectionRows solver={solver} deployments={activeDeployments} />
                </DeploymentsSection>
              )}
              {hasInactiveDeployments && (
                <DeploymentsSection $muted>
                  <DeploymentsSectionTitle $muted>Inactive</DeploymentsSectionTitle>
                  <DeploymentsSectionRows solver={solver} deployments={inactiveDeployments} />
                </DeploymentsSection>
              )}
            </>
          ) : (
            <DeploymentsEmpty>No deployments match the current filters.</DeploymentsEmpty>
          )}
        </DeploymentsPanel>
      </td>
    </tr>
  )
}
