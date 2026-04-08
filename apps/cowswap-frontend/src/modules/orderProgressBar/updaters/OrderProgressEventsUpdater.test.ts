import type { OrderFillability } from 'modules/ordersTable'

import {
  computeUnfillableOrderIds,
  EXECUTING_STEP_MIN_DISPLAY_TIME_MS,
  getCompletionDelayMs,
  getNewlyFillableOrderIds,
  shouldStageExecutingStep,
} from './utils'

import { OrderProgressBarStepName } from '../constants'

type TestOrder = {
  id: string
  isUnfillable?: boolean
}

const TEST_GENERIC_ORDER = { id: 'fillability-order' } as OrderFillability['order']

function createFillability(overrides: Omit<Partial<OrderFillability>, 'order'>): OrderFillability {
  return {
    hasEnoughBalance: true,
    hasEnoughAllowance: true,
    hasPermit: false,
    order: TEST_GENERIC_ORDER,
    ...overrides,
  }
}

const FILLABILITY_OK = createFillability({})
const FILLABILITY_LACKING_BALANCE = createFillability({ hasEnoughBalance: false })
const FILLABILITY_LACKING_ALLOWANCE = createFillability({ hasEnoughAllowance: false })

describe('computeUnfillableOrderIds', () => {
  it('includes orders flagged as unfillable by price', () => {
    const orders: TestOrder[] = [{ id: '1', isUnfillable: true }]

    const result = computeUnfillableOrderIds(orders, {})

    expect(result).toEqual(['1'])
  })

  it('includes orders lacking balance or allowance', () => {
    const orders: TestOrder[] = [{ id: '2' }]

    const result = computeUnfillableOrderIds(orders, {
      '2': FILLABILITY_LACKING_BALANCE,
    })

    expect(result).toEqual(['2'])
  })

  it('deduplicates orders flagged by both sources', () => {
    const orders: TestOrder[] = [{ id: '3', isUnfillable: true }]

    const result = computeUnfillableOrderIds(orders, {
      '3': FILLABILITY_LACKING_ALLOWANCE,
    })

    expect(result).toEqual(['3'])
  })

  it('ignores orders that are fillable and not flagged', () => {
    const orders: TestOrder[] = [{ id: '4', isUnfillable: false }, { id: '5' }]

    const result = computeUnfillableOrderIds(orders, {
      '4': FILLABILITY_OK,
      '5': FILLABILITY_OK,
    })

    expect(result).toEqual([])
  })
})

describe('getNewlyFillableOrderIds', () => {
  it('returns orders that were previously unfillable but not in the current set', () => {
    const previous = new Set(['1', '2', '3'])
    const current = new Set(['2', '3', '4'])

    const result = getNewlyFillableOrderIds(previous, current)

    expect(result).toEqual(['1'])
  })

  it('returns an empty list when nothing recovered', () => {
    const previous = new Set(['1'])
    const current = new Set(['1'])

    const result = getNewlyFillableOrderIds(previous, current)

    expect(result).toEqual([])
  })

  it('handles an empty previous set', () => {
    const previous = new Set<string>()
    const current = new Set(['1'])

    const result = getNewlyFillableOrderIds(previous, current)

    expect(result).toEqual([])
  })
})

describe('shouldStageExecutingStep', () => {
  it('requires executing before the final step when the order finishes from step 2', () => {
    const result = shouldStageExecutingStep(
      OrderProgressBarStepName.SOLVING,
      OrderProgressBarStepName.INITIAL,
      OrderProgressBarStepName.FINISHED,
    )

    expect(result).toBe(true)
  })

  it('does not stage executing again once it has already been shown', () => {
    const result = shouldStageExecutingStep(
      OrderProgressBarStepName.SUBMISSION_FAILED,
      OrderProgressBarStepName.EXECUTING,
      OrderProgressBarStepName.FINISHED,
    )

    expect(result).toBe(false)
  })

  it('does not move backwards from a completion step', () => {
    const result = shouldStageExecutingStep(
      OrderProgressBarStepName.FINISHED,
      OrderProgressBarStepName.SOLVING,
      OrderProgressBarStepName.FINISHED,
    )

    expect(result).toBe(false)
  })
})

describe('getCompletionDelayMs', () => {
  it('keeps executing visible for the configured minimum duration', () => {
    const result = getCompletionDelayMs(
      OrderProgressBarStepName.EXECUTING,
      OrderProgressBarStepName.FINISHED,
      1000,
      1500,
    )

    expect(result).toBe(EXECUTING_STEP_MIN_DISPLAY_TIME_MS - 500)
  })

  it('does not delay non-completion steps', () => {
    const result = getCompletionDelayMs(
      OrderProgressBarStepName.EXECUTING,
      OrderProgressBarStepName.DELAYED,
      1000,
      1500,
    )

    expect(result).toBe(0)
  })
})
