import type { OrderFillability } from 'modules/ordersTable'

import {
  computeUnfillableOrderIds,
  EXECUTING_STEP_MIN_DISPLAY_TIME_MS,
  getCompletionDelayMs,
  getNewlyFillableOrderIds,
  shouldShowUnfillableProgressStep,
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

const FILLABILITY_LACKING_BALANCE = createFillability({ hasEnoughBalance: false })
const FILLABILITY_LACKING_ALLOWANCE = createFillability({ hasEnoughAllowance: false })

describe('computeUnfillableOrderIds', () => {
  it('includes orders flagged as unfillable by price', () => {
    const orders: TestOrder[] = [{ id: '1', isUnfillable: true }]

    const result = computeUnfillableOrderIds(orders, {})

    expect(result).toEqual(['1'])
  })

  it('excludes orders when the only issue is allowance or balance lag', () => {
    const orders: TestOrder[] = [{ id: '2' }]

    const result = computeUnfillableOrderIds(orders, {
      '2': FILLABILITY_LACKING_BALANCE,
    })

    expect(result).toEqual([])
  })

  it('suppresses price change when a flagged order still has an allowance lag', () => {
    const orders: TestOrder[] = [{ id: '3', isUnfillable: true }]

    const result = computeUnfillableOrderIds(orders, {
      '3': FILLABILITY_LACKING_ALLOWANCE,
    })

    expect(result).toEqual([])
  })

  it('ignores orders that are fillable and not flagged', () => {
    const orders: TestOrder[] = [{ id: '4', isUnfillable: false }, { id: '5' }]

    const result = computeUnfillableOrderIds(orders, {})

    expect(result).toEqual([])
  })
})

describe('shouldShowUnfillableProgressStep', () => {
  it('keeps the price change screen for true price-derived unfillable states', () => {
    expect(shouldShowUnfillableProgressStep(true, undefined)).toBe(true)
  })

  it('suppresses the price change screen when allowance data has not caught up yet', () => {
    expect(shouldShowUnfillableProgressStep(true, FILLABILITY_LACKING_ALLOWANCE)).toBe(false)
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
    const result = shouldStageExecutingStep(OrderProgressBarStepName.SOLVING, OrderProgressBarStepName.FINISHED)

    expect(result).toBe(true)
  })

  it('restages executing after a submission retry path before finishing', () => {
    const result = shouldStageExecutingStep(
      OrderProgressBarStepName.SUBMISSION_FAILED,
      OrderProgressBarStepName.FINISHED,
    )

    expect(result).toBe(true)
  })

  it('replays executing after a retry even if the UI already moved back to solving', () => {
    const result = shouldStageExecutingStep(
      OrderProgressBarStepName.SOLVING,
      OrderProgressBarStepName.FINISHED,
      undefined,
    )

    expect(result).toBe(true)
  })

  it('does not replay executing after the current attempt already showed it', () => {
    const result = shouldStageExecutingStep(OrderProgressBarStepName.SOLVING, OrderProgressBarStepName.FINISHED, true)

    expect(result).toBe(false)
  })

  it('does not stage executing while the progress bar is still on the initial step', () => {
    const result = shouldStageExecutingStep(OrderProgressBarStepName.INITIAL, OrderProgressBarStepName.FINISHED)

    expect(result).toBe(false)
  })

  it('does not move backwards from a completion step', () => {
    const result = shouldStageExecutingStep(OrderProgressBarStepName.FINISHED, OrderProgressBarStepName.FINISHED)

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
