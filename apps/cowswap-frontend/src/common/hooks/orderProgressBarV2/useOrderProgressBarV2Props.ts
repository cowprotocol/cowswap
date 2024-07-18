import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'
import useSWR from 'swr'

import { ActivityDerivedState } from 'modules/account/containers/Transaction'

import { getPendingOrderStatus, PendingOrderStatusType } from 'api/cowProtocol/api'
import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'

import {
  ordersProgressBarStateAtom,
  updateOrderProgressBarBackendInfo,
  updateOrderProgressBarCountdown,
  updateOrderProgressBarStepName,
} from './atoms'
import { OrderProgressBarState, OrderProgressBarStepName } from './types'

export type UseOrderProgressBarPropsParams = {
  activityDerivedState: ActivityDerivedState | null
  chainId: SupportedChainId
}

export type UseOrderProgressBarV2Result = Pick<OrderProgressBarState, 'countdown' | 'solverCompetition'> & {
  stepName: Exclude<OrderProgressBarState['progressBarStepName'], undefined>
}

const MINIMUM_STEP_DISPLAY_TIME = ms`2s`

/**
 * Hook for fetching ProgressBarV2 props
 */
export function useOrderProgressBarV2Props(params: UseOrderProgressBarPropsParams): UseOrderProgressBarV2Result {
  const { activityDerivedState, chainId } = params

  const { order, isConfirmed = false, isUnfillable = false } = activityDerivedState || {}
  // Whether the order is in a final state, to avoid querying backend unnecessarily
  const isFinal = !!(order && getIsFinalizedOrder(order))

  const orderId = order?.id || ''

  // Fetch state from atom
  const { countdown, backendApiStatus, solverCompetition, progressBarStepName, lastTimeChangedSteps } =
    useGetExecutingOrderState(orderId)

  // Local updaters of the respective atom
  useBackendApiStatusUpdater(chainId, orderId, isFinal)
  useProgressBarStepNameUpdater(orderId, isUnfillable, isConfirmed, countdown, backendApiStatus, lastTimeChangedSteps)
  useCountdownStartUpdater(orderId, countdown, backendApiStatus)

  return useMemo(
    () => ({
      countdown,
      solverCompetition,
      stepName: progressBarStepName || 'initial',
    }),
    [countdown, solverCompetition, progressBarStepName]
  )
}

// atom related hooks

function useGetExecutingOrderState(orderId: string): OrderProgressBarState {
  const fullState = useAtomValue(ordersProgressBarStateAtom)
  const singleState = fullState[orderId]

  return useMemo(() => singleState || {}, [singleState])
}

function useSetExecutingOrderCountdownCallback() {
  const setAtom = useSetAtom(updateOrderProgressBarCountdown)

  return useCallback((orderId: string, value: number | null) => setAtom({ orderId, value }), [setAtom])
}

function useSetExecutingOrderProgressBarStepNameCallback() {
  const setValue = useSetAtom(updateOrderProgressBarStepName)

  return useCallback((orderId: string, value: OrderProgressBarStepName) => setValue({ orderId, value }), [setValue])
}

// local updaters

function useCountdownStartUpdater(
  orderId: string,
  countdown: OrderProgressBarState['countdown'],
  backendApiStatus: OrderProgressBarState['backendApiStatus']
) {
  const setCountdown = useSetExecutingOrderCountdownCallback()

  useEffect(() => {
    if (!countdown && countdown !== 0 && backendApiStatus === 'active') {
      // Start countdown when it becomes active
      setCountdown(orderId, 15)
    } else if (backendApiStatus === 'scheduled' || backendApiStatus === 'open') {
      // If for some reason it went back to start, reset it
      setCountdown(orderId, null)
    }
  }, [backendApiStatus, setCountdown, countdown, orderId])
}

function useProgressBarStepNameUpdater(
  orderId: string,
  isUnfillable: boolean,
  isConfirmed: boolean,
  countdown: OrderProgressBarState['countdown'],
  backendApiStatus: OrderProgressBarState['backendApiStatus'],
  lastTimeChangedSteps: OrderProgressBarState['lastTimeChangedSteps']
) {
  const setProgressBarStepName = useSetExecutingOrderProgressBarStepNameCallback()

  const stepName = getProgressBarStepName(isUnfillable, isConfirmed, countdown, backendApiStatus)

  // Update state with new step name
  useEffect(() => {
    function updateStepName() {
      setProgressBarStepName(orderId, stepName || 'initial')
    }

    let timer: NodeJS.Timeout

    const timeSinceLastChange = lastTimeChangedSteps ? Date.now() - lastTimeChangedSteps : 0

    if (lastTimeChangedSteps === undefined || timeSinceLastChange >= MINIMUM_STEP_DISPLAY_TIME) {
      updateStepName()
    } else {
      // Delay if it was updated less than MINIMUM_STEP_DISPLAY_TIME ago
      timer = setTimeout(updateStepName, MINIMUM_STEP_DISPLAY_TIME - timeSinceLastChange)
    }

    return () => {
      clearInterval(timer)
    }
  }, [orderId, stepName, lastTimeChangedSteps])
}

function getProgressBarStepName(
  isUnfillable: boolean,
  isConfirmed: boolean,
  countdown: OrderProgressBarState['countdown'],
  backendApiStatus: OrderProgressBarState['backendApiStatus']
): OrderProgressBarStepName {
  if (isUnfillable) {
    // out of market order
    return 'unfillable'
  } else if (isConfirmed) {
    // already traded
    return 'finished'
  } else if (backendApiStatus === 'active' && countdown === 0) {
    // solving, but took longer than stipulated countdown
    return 'delayed'
  } else if (backendApiStatus) {
    // straight mapping API status to progress bar steps
    return BACKEND_TYPE_TO_PROGRESS_BAR_STEP_NAME[backendApiStatus]
  }

  return 'initial'
}

const BACKEND_TYPE_TO_PROGRESS_BAR_STEP_NAME: Record<PendingOrderStatusType, OrderProgressBarStepName> = {
  scheduled: 'initial',
  open: 'initial',
  active: 'solving',
  solved: 'solved',
  executing: 'executing',
  traded: 'finished',
  cancelled: 'initial', // TODO: maybe add another state for finished with error?
}

function useBackendApiStatusUpdater(chainId: SupportedChainId, orderId: string, isFinal: boolean) {
  const setAtom = useSetAtom(updateOrderProgressBarBackendInfo)
  const { type: backendApiStatus, value: solverCompetition } = usePendingOrderStatus(chainId, orderId, isFinal) || {}

  useEffect(() => {
    if (orderId && (backendApiStatus || solverCompetition)) {
      setAtom({ orderId, value: { backendApiStatus, solverCompetition } })
    }
  }, [orderId, setAtom, backendApiStatus, solverCompetition])
}

const POOLING_SWR_OPTIONS = {
  refreshInterval: ms`1s`,
}

function usePendingOrderStatus(chainId: SupportedChainId, orderId: string, stopQuerying?: boolean) {
  return useSWR(
    chainId && orderId ? ['getPendingOrderStatus', chainId, orderId] : null,
    async ([, _chainId, _orderId]) => getPendingOrderStatus(_chainId, _orderId),
    stopQuerying ? SWR_NO_REFRESH_OPTIONS : POOLING_SWR_OPTIONS
  ).data
}
