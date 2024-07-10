import { atom } from 'jotai'

import { deepEqual } from '@cowprotocol/common-utils'
import { ExecutingOrdersCountdown, ExecutingOrdersState, ExecutingOrderState } from './types'

/**
 * Base Atom for executing orders state
 */
export const executingOrdersStateAtom = atom<ExecutingOrdersState>({})

/**
 * Derived atom exposing only the countdown
 */
export const executingOrdersCountdownAtom = atom(
  (get) => {
    const fullState = get(executingOrdersStateAtom)

    return Object.keys(fullState).reduce<ExecutingOrdersCountdown>((acc, orderId) => {
      const countdown = fullState[orderId].countdown
      if (countdown) {
        acc[orderId] = countdown
      }
      return acc
    }, {})
  },
  (get, set, countdowns: ExecutingOrdersCountdown) => {
    const fullState = { ...get(executingOrdersStateAtom) }
    Object.keys(countdowns).forEach((orderId) => {
      fullState[orderId].countdown = countdowns[orderId]
    })
    set(executingOrdersStateAtom, fullState)
  }
)

type UpdateSingleExecutingOrderCountdownParams = {
  orderId: string
  value: number | null
}

/**
 * Derived write-only atom for updating a single countdown at a time
 */
export const updateSingleExecutingOrderCountdown = atom(
  null,
  (get, set, { orderId, value }: UpdateSingleExecutingOrderCountdownParams) => {
    const fullState = get(executingOrdersStateAtom)

    const singleOrderState = { ...fullState[orderId] }
    const currentValue = singleOrderState.countdown

    if (currentValue === value) {
      return
    }

    if (value === null) {
      delete singleOrderState.countdown
    } else {
      singleOrderState.countdown = value
    }

    set(executingOrdersStateAtom, { ...fullState, [orderId]: singleOrderState })
  }
)

type UpdateSingleExecutingOrderStateParams = {
  orderId: string
  value: ExecutingOrderState | null
}

/**
 * Derived write-only atom for updating a single state at a time
 */
export const updateSingleExecutingOrderState = atom(
  null,
  (get, set, { orderId, value }: UpdateSingleExecutingOrderStateParams) => {
    const fullState = { ...get(executingOrdersStateAtom) }

    const currentValue = fullState[orderId]

    if (deepEqual(currentValue, value)) {
      return
    }

    if (value === null) {
      delete fullState[orderId]
    } else {
      fullState[orderId] = value
    }

    set(executingOrdersStateAtom, fullState)
  }
)
