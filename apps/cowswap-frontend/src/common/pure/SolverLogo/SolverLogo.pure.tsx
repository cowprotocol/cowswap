import { ReactNode } from 'react'

import { SolverCompetition } from 'common/types/soverCompetition'

import * as styledEl from './SolverLogo.styled'

export interface SolverLogoProps {
  solver: Pick<SolverCompetition, 'displayName' | 'image'>
  size: number
  className?: string
}

export function SolverLogo({ solver: { displayName, image }, size, className }: SolverLogoProps): ReactNode {
  return (
    <styledEl.LogoFrame $size={size} className={className} aria-hidden>
      {image ? (
        <styledEl.LogoImage src={image} alt="" />
      ) : (
        getSolverInitial(displayName) || <styledEl.UnknownSolverIcon />
      )}
    </styledEl.LogoFrame>
  )
}

function getSolverInitial(displayName = ''): string {
  const [initial = ''] = Array.from(displayName.trim())

  return initial.toUpperCase()
}
