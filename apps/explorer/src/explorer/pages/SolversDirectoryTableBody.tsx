import React from 'react'

import { Placeholder } from './Solvers.styles'
import { filterDeployments, filterDeploymentsByActiveStatus } from './SolversDirectoryTable.helpers'
import { SolverDetailsRow, SolverSummaryRow } from './SolversDirectoryTableRows'

import { SolverInfo } from '../../utils/fetchSolversInfo'

export function SolversDirectoryTableBody({
  filteredSolvers,
  expandedRows,
  networkFilter,
  environmentFilter,
  activeFilter,
  onToggle,
}: SolversDirectoryTableBodyProps): React.ReactNode {
  if (!filteredSolvers.length) {
    return (
      <tr>
        <td colSpan={3}>
          <Placeholder>No solvers match your current filters.</Placeholder>
        </td>
      </tr>
    )
  }

  return filteredSolvers.flatMap((solver) => {
    const isExpanded = !!expandedRows[solver.solverId]
    const deployments = filterDeploymentsByActiveStatus(
      filterDeployments(solver.deployments, networkFilter, environmentFilter),
      activeFilter,
    )
    const summary = (
      <SolverSummaryRow
        key={solver.solverId}
        solver={solver}
        deployments={deployments}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />
    )

    if (!isExpanded) {
      return [summary]
    }

    return [summary, <SolverDetailsRow key={`${solver.solverId}-details`} deployments={deployments} />]
  })
}

type SolversDirectoryTableBodyProps = {
  filteredSolvers: SolverInfo[]
  expandedRows: Record<string, boolean>
  networkFilter: string
  environmentFilter: string
  activeFilter: string
  onToggle: (solverId: string) => void
}
