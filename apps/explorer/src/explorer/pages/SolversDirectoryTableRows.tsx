import React from 'react'

import {
  DeploymentsEmpty,
  DeploymentsPanel,
  DeploymentsPanelTitle,
  DeploymentsSection,
  DeploymentsSectionTitle,
  ExpandButton,
  SolverCell,
  SolverDetails,
  SolverId,
} from './SolversDirectoryTable.styles'
import { mapSummaryEnvironments, mapSummaryNetworks } from './SolversDirectoryTable.utils'
import { DeploymentsSectionRows, EnvironmentTags, NetworkChips, SolverIcon } from './SolversDirectoryTableComponents'

import { SolverDeployment, SolverInfo } from '../../utils/fetchSolversInfo'

type SolverDetailsRowProps = {
  deployments: SolverDeployment[]
}

type SolverSummaryRowProps = {
  solver: SolverInfo
  deployments: SolverDeployment[]
  isExpanded: boolean
  onToggle: (solverId: string) => void
}

export function SolverDetailsRow({ deployments }: SolverDetailsRowProps): React.ReactNode {
  const activeDeployments = deployments.filter((deployment) => deployment.active)
  const inactiveDeployments = deployments.filter((deployment) => !deployment.active)
  const hasActiveDeployments = activeDeployments.length > 0
  const hasInactiveDeployments = inactiveDeployments.length > 0
  const hasAnyDeployments = hasActiveDeployments || hasInactiveDeployments

  return (
    <tr className="solver-details-row">
      <td colSpan={3}>
        <DeploymentsPanel>
          <DeploymentsPanelTitle>Solver addresses by chain/environment</DeploymentsPanelTitle>
          {hasAnyDeployments ? (
            <>
              {hasActiveDeployments && (
                <DeploymentsSection>
                  <DeploymentsSectionTitle>Active</DeploymentsSectionTitle>
                  <DeploymentsSectionRows deployments={activeDeployments} />
                </DeploymentsSection>
              )}
              {hasInactiveDeployments && (
                <DeploymentsSection $muted>
                  <DeploymentsSectionTitle $muted>Inactive</DeploymentsSectionTitle>
                  <DeploymentsSectionRows deployments={inactiveDeployments} />
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
    <tr className="solver-summary-row" data-solver-id={solver.solverId}>
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
    </tr>
  )
}
