import { atom } from 'jotai'

import { deepEqual } from '@cowprotocol/common-utils'

import {
  OrderProgressBarState,
  OrderProgressBarStepName,
  OrdersProgressBarCountdown,
  OrdersProgressBarState,
} from '../types'

/**
 * Base Atom for orders progress bar state
 */
export const ordersProgressBarStateAtom = atom<OrdersProgressBarState>({})

/**
 * Derived write-only atom for removing state entries no longer tracked
 */
export const pruneOrdersProgressBarState = atom(null, (get, set, trackedOrderIds: string[]) => {
  const fullState = get(ordersProgressBarStateAtom)
  const trackedIds = new Set(trackedOrderIds)

  let changed = false
  const nextState = Object.entries(fullState).reduce<OrdersProgressBarState>((acc, [orderId, state]) => {
    if (trackedIds.has(orderId)) {
      acc[orderId] = state
    } else {
      changed = true
    }

    return acc
  }, {})

  if (!changed) {
    return
  }

  set(ordersProgressBarStateAtom, nextState)
})

/**
 * Derived atom exposing only the countdown
 */
export const ordersProgressBarCountdown = atom(
  (get) => {
    const fullState = get(ordersProgressBarStateAtom)

    return Object.keys(fullState).reduce<OrdersProgressBarCountdown>((acc, orderId) => {
      const countdown = fullState[orderId].countdown
      if (countdown) {
        acc[orderId] = countdown
      }
      return acc
    }, {})
  },
  (get, set, countdowns: OrdersProgressBarCountdown) => {
    const fullState = { ...get(ordersProgressBarStateAtom) }
    Object.keys(countdowns).forEach((orderId) => {
      fullState[orderId].countdown = countdowns[orderId]
    })
    set(ordersProgressBarStateAtom, fullState)
  },
)

type UpdateOrderProgressBarCountdownParams = {
  orderId: string
  value: number | null
}

/**
 * Derived write-only atom for updating a single countdown at a time
 */
export const updateOrderProgressBarCountdown = atom(
  null,
  (get, set, { orderId, value }: UpdateOrderProgressBarCountdownParams) => {
    const fullState = get(ordersProgressBarStateAtom)

    const previousOrderState = fullState[orderId]

    if (!previousOrderState) {
      if (value === null) {
        return
      }

      set(ordersProgressBarStateAtom, {
        ...fullState,
        [orderId]: { countdown: value },
      })

      return
    }

    if (value === null) {
      if (previousOrderState.countdown == null) {
        return
      }

      const nextOrderState = { ...previousOrderState }
      delete nextOrderState.countdown

      set(ordersProgressBarStateAtom, { ...fullState, [orderId]: nextOrderState })

      return
    }

    if (previousOrderState.countdown === value) {
      return
    }

    set(ordersProgressBarStateAtom, {
      ...fullState,
      [orderId]: {
        ...previousOrderState,
        countdown: value,
      },
    })
  },
)

type UpdateOrderProgressBarStepNameParams = {
  orderId: string
  value: OrderProgressBarStepName
}

/**
 * Derived write-only atom for updating a single progressBarStepName at a time
 */
export const updateOrderProgressBarStepName = atom(
  null,
  (get, set, { orderId, value }: UpdateOrderProgressBarStepNameParams) => {
    const fullState = get(ordersProgressBarStateAtom)

    const singleOrderState = { ...fullState[orderId] }
    const currentValue = singleOrderState.progressBarStepName

    if (currentValue === value) {
      return
    }

    // Keep track of previous status
    singleOrderState.previousStepName = singleOrderState.progressBarStepName
    // Update current status
    singleOrderState.progressBarStepName = value
    // Keep track when state was changed
    singleOrderState.lastTimeChangedSteps = Date.now()

    set(ordersProgressBarStateAtom, { ...fullState, [orderId]: singleOrderState })
  },
)

type UpdateOrderProgressBarBackendInfoParams = {
  orderId: string
  value: Pick<OrderProgressBarState, 'backendApiStatus' | 'solverCompetition'>
}

/**
 * Derived write-only atom for updating a single order backendApiStatus and solverCompetition
 */
export const updateOrderProgressBarBackendInfo = atom(
  null,
  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line complexity
  (get, set, { orderId, value: { backendApiStatus, solverCompetition } }: UpdateOrderProgressBarBackendInfoParams) => {
    const fullState = get(ordersProgressBarStateAtom)

    const singleOrderState = { ...fullState[orderId] }
    const currentBackendApiStatus = singleOrderState.backendApiStatus
    const currentSolverCompetition = singleOrderState.solverCompetition

    const backendApiStatusChanged = currentBackendApiStatus !== backendApiStatus

    const solverCompetitionChanged =
      (!currentSolverCompetition && !!solverCompetition) ||
      (!!currentSolverCompetition && !solverCompetition) ||
      (!!currentSolverCompetition && !!solverCompetition && !deepEqual(currentSolverCompetition, solverCompetition))

    if (!backendApiStatusChanged && !solverCompetitionChanged) {
      return
    }

    singleOrderState.previousBackendApiStatus = currentBackendApiStatus
    singleOrderState.backendApiStatus = backendApiStatus

    // Only update solver competition if changed and not falsy
    if (solverCompetitionChanged && solverCompetition) {
      singleOrderState.solverCompetition = solverCompetition
    }

    set(ordersProgressBarStateAtom, {
      ...fullState,
      [orderId]: singleOrderState,
    })
  },
)

/**
 * Derived write-only atom for setting cancellationTriggered
 *
 * Can only set it to true, since there's no way to cancel a cancellation once requested
 */
export const setOrderProgressBarCancellationTriggered = atom(null, (get, set, orderId: string) => {
  const fullState = get(ordersProgressBarStateAtom)

  const singleState = { ...fullState[orderId] }

  if (singleState.cancellationTriggered) {
    // Already triggered, nothing to do here
    return
  }

  singleState.cancellationTriggered = true

  set(ordersProgressBarStateAtom, { ...fullState, [orderId]: singleState })
})

export const cancellationTrackedOrderIdsAtom = atom((get) => {
  const fullState = get(ordersProgressBarStateAtom)

  return Object.entries(fullState)
    .filter(([, state]) => state?.cancellationTriggered)
    .map(([orderId]) => orderId)
})
