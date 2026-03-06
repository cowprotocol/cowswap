import React from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'

import {
  DeploymentsGridHeader,
  DeploymentsGridRow,
  EnvTag,
  EnvTags,
  Mono,
  NetworkChip,
  NetworkIcon,
  Networks,
  SolverLogo,
  SolverLogoFallback,
} from './SolversDirectoryTable.styles'

import { AddressLink } from '../../components/common/AddressLink'
import { SolverDeployment, SolverInfo } from '../../utils/fetchSolversInfo'

import type { SummaryNetwork } from './SolversDirectoryTable.utils'

type ChainInfoEntry = {
  logo?: {
    light?: string
  }
}

const CHAIN_INFO_BY_ID = CHAIN_INFO as Partial<Record<number, ChainInfoEntry>>

export function DeploymentsSectionRows({
  solver,
  deployments,
}: {
  solver: SolverInfo
  deployments: SolverDeployment[]
}): React.ReactNode {
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

export function EnvironmentTags({
  solverId,
  environments,
}: {
  solverId: string
  environments: string[]
}): React.ReactNode {
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

export function NetworkChips({
  solverId,
  networks,
}: {
  solverId: string
  networks: SummaryNetwork[]
}): React.ReactNode {
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

export function SolverIcon({ solver }: { solver: SolverInfo }): React.ReactNode {
  if (solver.image) return <SolverLogo src={solver.image} alt={`${solver.displayName} logo`} />
  return <SolverLogoFallback>{solver.displayName.charAt(0).toUpperCase()}</SolverLogoFallback>
}

function getChainIcon(chainId: number): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(CHAIN_INFO_BY_ID, chainId)) {
    return undefined
  }

  return CHAIN_INFO_BY_ID[chainId]?.logo?.light || undefined
}
