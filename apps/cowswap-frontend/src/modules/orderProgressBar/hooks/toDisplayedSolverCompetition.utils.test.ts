import type { SolverInfo } from '@cowprotocol/core'
import { getAddressKey } from '@cowprotocol/cow-sdk'

import type { SolverCompetition } from 'common/types/soverCompetition'

import { toDisplayedSolverCompetition } from './toDisplayedSolverCompetition.utils'

const WINNER = '0x1111111111111111111111111111111111111111'
const OTHER = '0x3333333333333333333333333333333333333333'

function row(solver: string, marker: string): SolverCompetition {
  return { executedAmounts: { buy: marker, sell: '1' }, solver } as SolverCompetition
}

describe('toDisplayedSolverCompetition', () => {
  it('keeps the winner first and applies the solver display name', () => {
    const byAddress = {
      [getAddressKey(WINNER)]: { displayName: 'Tsolver', solverId: 'tsolver' },
      [getAddressKey(OTHER)]: { displayName: 'Barter', solverId: 'barter' },
    } as unknown as Record<string, SolverInfo>

    const displayed = toDisplayedSolverCompetition([row(WINNER, 'winner'), row(OTHER, 'other')], byAddress)

    expect(displayed.map((solver) => solver.solverId)).toEqual(['tsolver', 'barter'])
    expect(displayed[0]?.executedAmounts?.buy).toBe('winner')
    expect(displayed[0]?.displayName).toBe('Tsolver')
  })

  it('returns an empty list when there are no rows', () => {
    expect(toDisplayedSolverCompetition([], {})).toEqual([])
  })
})
