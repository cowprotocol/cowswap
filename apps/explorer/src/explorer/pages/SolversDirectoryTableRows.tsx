import React from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { ExternalLink } from '@cowprotocol/ui'

import { Placeholder } from './Solvers.styles'
import {
  DeploymentsGridHeader,
  DeploymentsGridRow,
  DeploymentsPanel,
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

function NetworkChips({ solver }: { solver: SolverInfo }): React.ReactNode {
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

function EnvironmentTags({ solver }: { solver: SolverInfo }): React.ReactNode {
  const environments = new Set<string>()

  solver.networks.forEach((network) => {
    network.environments.forEach((environment) => {
      environments.add(environment)
    })
  })

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

type SolverSummaryRowProps = {
  solver: SolverInfo
  isExpanded: boolean
  onToggle: (solverId: string) => void
}

export function SolverSummaryRow({ solver, isExpanded, onToggle }: SolverSummaryRowProps): React.ReactNode {
  const toggleAriaLabel = `Toggle deployments for solver ${solver.displayName} (${solver.solverId})`

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
        <NetworkChips solver={solver} />
      </td>
      <td className="envs">
        <EnvironmentTags solver={solver} />
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

export function SolverDetailsRow({ solver, deployments }: SolverDetailsRowProps): React.ReactNode {
  return (
    <tr>
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
              key={`${solver.solverId}-${deployment.chainId}-${deployment.environment || 'na'}-${index}`}
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
