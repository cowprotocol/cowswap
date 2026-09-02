import { getAddressKey } from '@cowprotocol/cow-sdk'

import { ApiSolverCompetition } from 'common/types/soverCompetition'

import { buildSolverCompetition, getProgressBarStepName, shouldUpdateStepImmediately } from './useOrderProgressBarProps'

import { OrderProgressBarStepName } from '../constants'
import { OrderProgressBarState } from '../types'

const OPEN_STATUS = 'open' as OrderProgressBarState['backendApiStatus']
const EXECUTING_STATUS = 'executing' as OrderProgressBarState['backendApiStatus']

describe('getProgressBarStepName', () => {
  function callGetProgressBarStepName({
    isUnfillable = false,
    backendApiStatus,
    previousStepName = OrderProgressBarStepName.SOLVING,
    previousBackendApiStatus,
  }: {
    isUnfillable?: boolean
    backendApiStatus?: OrderProgressBarState['backendApiStatus']
    previousStepName?: OrderProgressBarStepName | undefined
    previousBackendApiStatus?: OrderProgressBarState['previousBackendApiStatus']
  }): OrderProgressBarStepName {
    return getProgressBarStepName(
      isUnfillable,
      false, // isCancelled
      false, // isExpired
      false, // isCancelling
      undefined, // cancellationTriggered
      false, // isConfirmed
      null, // countdown
      backendApiStatus,
      previousBackendApiStatus,
      previousStepName,
      undefined, // bridgingStatus
      false, // isBridgingTrade
    )
  }

  it('keeps the solving animation when an order recovers from unfillable without backend status', () => {
    const result = callGetProgressBarStepName({
      previousStepName: OrderProgressBarStepName.UNFILLABLE,
    })

    expect(result).toBe(OrderProgressBarStepName.SOLVING)
  })

  it('keeps the solving animation when backend status is open after an unfillable recovery', () => {
    const result = callGetProgressBarStepName({
      backendApiStatus: OPEN_STATUS,
      previousStepName: OrderProgressBarStepName.UNFILLABLE,
    })

    expect(result).toBe(OrderProgressBarStepName.SOLVING)
  })

  it('still transitions to executing when the backend reports progress', () => {
    const result = callGetProgressBarStepName({
      backendApiStatus: EXECUTING_STATUS,
      previousStepName: OrderProgressBarStepName.UNFILLABLE,
      previousBackendApiStatus: OPEN_STATUS,
    })

    expect(result).toBe(OrderProgressBarStepName.EXECUTING)
  })
})

describe('shouldUpdateStepImmediately', () => {
  const MINIMUM_STEP_DISPLAY_TIME = 5000 // ms`5s`
  const RECENT_CHANGE = 1000 // less than MINIMUM_STEP_DISPLAY_TIME

  it('bypasses the debounce for cancellation and terminal steps even when the last change is recent', () => {
    const immediateSteps = [
      OrderProgressBarStepName.CANCELLING,
      OrderProgressBarStepName.CANCELLED,
      OrderProgressBarStepName.CANCELLATION_FAILED,
      OrderProgressBarStepName.EXPIRED,
      OrderProgressBarStepName.FINISHED,
    ]

    immediateSteps.forEach((stepName) => {
      expect(shouldUpdateStepImmediately(stepName, Date.now(), RECENT_CHANGE)).toBe(true)
    })
  })

  it('debounces a normal step when the previous step was shown less than the minimum display time ago', () => {
    expect(shouldUpdateStepImmediately(OrderProgressBarStepName.SOLVING, Date.now(), RECENT_CHANGE)).toBe(false)
  })

  it('shows a normal step immediately once the minimum display time has elapsed', () => {
    expect(shouldUpdateStepImmediately(OrderProgressBarStepName.SOLVING, Date.now(), MINIMUM_STEP_DISPLAY_TIME)).toBe(
      true,
    )
  })

  it('shows the first step immediately when there is no previous change timestamp', () => {
    expect(shouldUpdateStepImmediately(OrderProgressBarStepName.SOLVING, undefined, 0)).toBe(true)
  })
})

describe('buildSolverCompetition', () => {
  // Backend returns entries ranked ascending, so the last entry is the winner. A `marker` tags
  // each raw entry so we can assert which duplicate occurrence survived deduplication.
  function entry(solver: string, marker: string): ApiSolverCompetition {
    return { solver, marker, executedAmounts: { sell: '1', buy: '1' } } as unknown as ApiSolverCompetition
  }

  const ADDR_LIVE = '0x1111111111111111111111111111111111111111'
  const ADDR_RETIRED = '0x2222222222222222222222222222222222222222'
  const ADDR_OTHER = '0x3333333333333333333333333333333333333333'
  // A solver's live and retired deployments are distinct on-chain addresses that the CMS maps to
  // the same solverId; a different solver maps to its own.
  const byAddress = {
    [getAddressKey(ADDR_LIVE)]: { solverId: 'baseline' },
    [getAddressKey(ADDR_RETIRED)]: { solverId: 'baseline' },
    [getAddressKey(ADDR_OTHER)]: { solverId: 'barter' },
  } as unknown as Parameters<typeof buildSolverCompetition>[1]

  it('keeps the highest-ranked occurrence of a repeated solver as the winner', () => {
    const result = buildSolverCompetition(
      [entry(ADDR_LIVE, 'first'), entry(ADDR_OTHER, 'barter'), entry(ADDR_RETIRED, 'last')],
      byAddress,
    )

    expect(result.map((s) => s.solverId)).toEqual(['baseline', 'barter'])
    // Winner stays at index 0 and is the highest-ranked (last) `baseline` occurrence, not the first.
    expect((result[0] as unknown as { marker: string }).marker).toBe('last')
  })

  it('collapses distinct addresses that resolve to the same solverId', () => {
    const result = buildSolverCompetition([entry(ADDR_LIVE, 'live'), entry(ADDR_RETIRED, 'retired')], byAddress)

    expect(result.map((s) => s.solverId)).toEqual(['baseline'])
    // The higher-ranked (last) address wins the collapsed entry.
    expect((result[0] as unknown as { marker: string }).marker).toBe('retired')
  })

  it('does not deduplicate distinct solvers', () => {
    const result = buildSolverCompetition([entry(ADDR_OTHER, 'barter'), entry(ADDR_LIVE, 'baseline')], byAddress)

    expect(result.map((s) => s.solverId)).toEqual(['baseline', 'barter'])
  })

  it('excludes entries without a solver or executedAmounts', () => {
    const result = buildSolverCompetition(
      [
        { marker: 'no-solver', executedAmounts: {} } as unknown as ApiSolverCompetition,
        { solver: ADDR_LIVE, marker: 'no-amounts' } as unknown as ApiSolverCompetition,
        entry(ADDR_OTHER, 'valid'),
      ],
      byAddress,
    )

    expect(result.map((s) => s.solverId)).toEqual(['barter'])
  })

  it('returns an empty list when there is no competition data', () => {
    expect(buildSolverCompetition(undefined, {})).toEqual([])
  })
})
