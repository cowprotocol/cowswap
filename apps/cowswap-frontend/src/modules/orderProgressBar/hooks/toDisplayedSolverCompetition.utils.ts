import type { SolverInfo } from '@cowprotocol/core'

import type { SolverCompetition } from 'common/types/soverCompetition'

import { buildSolverCompetition } from './useOrderProgressBarProps'

// buildSolverCompetition keeps the last row of each solver, so winner-first rows are reversed first.
export function toDisplayedSolverCompetition(
  rows: readonly SolverCompetition[],
  solversInfoByAddress: Record<string, SolverInfo>,
): SolverCompetition[] {
  if (rows.length === 0) return []

  return buildSolverCompetition([...rows].reverse(), solversInfoByAddress)
}
