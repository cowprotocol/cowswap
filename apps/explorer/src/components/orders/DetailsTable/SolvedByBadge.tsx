import { ReactNode } from 'react'

import { SolverBadge, SolverBadgeFallback, SolverBadgeLogo, SolverBadgeName } from './styled'

import { OrderSolverInfo } from '../../../hooks/useOrderSolver'

export function SolvedByBadge({ solvedBy }: { solvedBy?: OrderSolverInfo }): ReactNode {
  if (!solvedBy) return '-'

  return (
    <SolverBadge to="/solvers">
      {solvedBy.image ? (
        <SolverBadgeLogo src={solvedBy.image} alt={`${solvedBy.displayName} logo`} />
      ) : (
        <SolverBadgeFallback>{solvedBy.displayName.charAt(0).toUpperCase()}</SolverBadgeFallback>
      )}
      <SolverBadgeName>{solvedBy.displayName}</SolverBadgeName>
    </SolverBadge>
  )
}
