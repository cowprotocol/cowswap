import { ReactNode } from 'react'

import { SolverCompetition } from 'common/types/soverCompetition'

import * as styledEl from './SolverLogo.styled'

export interface SolverLogoProps {
  solver: Pick<SolverCompetition, 'solver' | 'displayName' | 'image'>
  size: number
  className?: string
}

export function SolverLogo({ solver, size, className }: SolverLogoProps): ReactNode {
  return (
    <styledEl.LogoFrame $size={size} className={className} aria-hidden>
      {solver.image ? <styledEl.LogoImage src={solver.image} alt="" /> : getSolverInitial(solver)}
    </styledEl.LogoFrame>
  )
}

function getSolverInitial({ displayName, solver }: SolverLogoProps['solver']): string {
  const [initial = ''] = Array.from(displayName?.trim() || solver)

  return initial.toUpperCase()
}
