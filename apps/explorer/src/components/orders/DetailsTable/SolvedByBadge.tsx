import { ReactNode } from 'react'

import { SolverBadge, SolverBadgeFallback, SolverBadgeLogo, SolverBadgeName } from './styled'

import { OrderSolverInfo } from '../../../hooks/useOrderSolver'

export function SolvedByBadge({ solvedBy }: { solvedBy?: OrderSolverInfo }): ReactNode {
  if (!solvedBy) return '-'
  const displayNameInitial = solvedBy.displayName.trim().charAt(0).toUpperCase()
  const solverIdInitial = solvedBy.solverId.trim().charAt(0).toUpperCase()
  const fallbackInitial = displayNameInitial || solverIdInitial || '?'

  return (
    <SolverBadge to="/solvers">
      {solvedBy.image ? (
        <SolverBadgeLogo src={solvedBy.image} alt={`${solvedBy.displayName} logo`} />
      ) : (
        <SolverBadgeFallback>{fallbackInitial}</SolverBadgeFallback>
      )}
      <SolverBadgeName>{solvedBy.displayName}</SolverBadgeName>
    </SolverBadge>
  )
}
