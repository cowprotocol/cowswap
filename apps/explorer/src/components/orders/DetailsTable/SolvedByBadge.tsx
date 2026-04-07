import { ReactNode } from 'react'

import { SolverBadge, SolverBadgeFallback, SolverBadgeLogo, SolverBadgeName } from './styled'

import { OrderSolverInfo } from '../../../hooks/useOrderSolver'

export function SolvedByBadge({ solvedBy }: { solvedBy?: OrderSolverInfo }): ReactNode {
  if (!solvedBy) return '-'
  const displayName = solvedBy.displayName.trim() || solvedBy.solverId.trim() || 'Unknown solver'
  const targetSolver = solvedBy.solverId.trim() || solvedBy.displayName.trim()
  const solverDetailsLink = targetSolver ? `/solvers?solver=${encodeURIComponent(targetSolver)}` : '/solvers'
  const displayNameInitial = displayName.charAt(0).toUpperCase()
  const solverIdInitial = solvedBy.solverId.trim().charAt(0).toUpperCase()
  const fallbackInitial = displayNameInitial || solverIdInitial || '?'

  return (
    <SolverBadge to={solverDetailsLink}>
      {solvedBy.image ? (
        <SolverBadgeLogo src={solvedBy.image} alt={`${displayName} logo`} />
      ) : (
        <SolverBadgeFallback>{fallbackInitial}</SolverBadgeFallback>
      )}
      <SolverBadgeName>{displayName}</SolverBadgeName>
    </SolverBadge>
  )
}
