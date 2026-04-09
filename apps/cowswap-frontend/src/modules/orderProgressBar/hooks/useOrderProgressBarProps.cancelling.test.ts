import { getProgressBarStepName } from './useOrderProgressBarProps'

import { OrderProgressBarStepName } from '../constants'
import { OrderProgressBarState } from '../types'

const OPEN_STATUS = 'open' as OrderProgressBarState['backendApiStatus']

describe('getProgressBarStepName cancelling regressions', () => {
  it('prioritizes cancelling over the price change step for open unfillable orders', () => {
    const result = getProgressBarStepName(
      true, // isUnfillable
      false, // isCancelled
      false, // isExpired
      true, // isCancelling
      undefined, // cancellationTriggered
      false, // isConfirmed
      null, // countdown
      OrderProgressBarStepName.UNFILLABLE,
      OPEN_STATUS,
      OPEN_STATUS,
      OrderProgressBarStepName.SOLVING,
      undefined,
      undefined,
      false,
    )

    expect(result).toBe(OrderProgressBarStepName.CANCELLING)
  })
})
