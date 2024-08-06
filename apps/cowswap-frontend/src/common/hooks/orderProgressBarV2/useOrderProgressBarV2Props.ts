import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { CompetitionOrderStatus, SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'
import useSWR from 'swr'

import { ActivityDerivedState } from 'modules/account/containers/Transaction'
import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { getOrderCompetitionStatus } from 'api/cowProtocol/api'
import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'

import {
  ordersProgressBarStateAtom,
  setOrderProgressBarCancellationTriggered,
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

const MINIMUM_STEP_DISPLAY_TIME = ms`5s`

/**
 * Hook for fetching ProgressBarV2 props
 */
export function useOrderProgressBarV2Props(
  params: UseOrderProgressBarPropsParams
): UseOrderProgressBarV2Result | undefined {
  const { activityDerivedState, chainId } = params

  const {
    order,
    isConfirmed = false,
    isUnfillable = false,
    isCancelling = false,
    isCancelled = false,
    isExpired = false,
    isCreating = false,
    isPresignaturePending = false,
  } = activityDerivedState || {}

  const { disableProgressBar: widgetDisabled = false } = useInjectedWidgetParams()

  // Do not build progress bar data when these conditions are set
  const disableProgressBar = widgetDisabled || isCreating || isPresignaturePending

  // When the order is in a final state or progress bar is disabled, avoid querying backend unnecessarily
  const doNotQuery = !!(order && getIsFinalizedOrder(order)) || disableProgressBar

  const orderId = order?.id || ''

  // Fetch state from atom
  const {
    countdown,
    backendApiStatus,
    solverCompetition,
    progressBarStepName,
    previousStepName,
    lastTimeChangedSteps,
    cancellationTriggered,
  } = useGetExecutingOrderState(orderId)

  // Local updaters of the respective atom
  useBackendApiStatusUpdater(chainId, orderId, doNotQuery)
  useProgressBarStepNameUpdater(
    orderId,
    isUnfillable,
    isCancelled,
    isExpired,
    isCancelling,
    cancellationTriggered,
    isConfirmed,
    countdown,
    backendApiStatus,
    lastTimeChangedSteps,
    previousStepName
  )
  useCancellingOrderUpdater(orderId, isCancelling)
  useCountdownStartUpdater(orderId, countdown, backendApiStatus)

  return useMemo(() => {
    if (disableProgressBar) {
      return undefined
    }

    return {
      countdown,
      solverCompetition,
      stepName: progressBarStepName || 'initial',
    }
  }, [disableProgressBar, countdown, solverCompetition, progressBarStepName])
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

function useCancellingOrderUpdater(orderId: string, isCancelling: boolean) {
  const setCancellationTriggered = useSetAtom(setOrderProgressBarCancellationTriggered)

  useEffect(() => {
    if (isCancelling) setCancellationTriggered(orderId)
  }, [orderId, isCancelling])
}

function useProgressBarStepNameUpdater(
  orderId: string,
  isUnfillable: boolean,
  isCancelled: boolean,
  isExpired: boolean,
  isCancelling: boolean,
  cancellationTriggered: undefined | true,
  isConfirmed: boolean,
  countdown: OrderProgressBarState['countdown'],
  backendApiStatus: OrderProgressBarState['backendApiStatus'],
  lastTimeChangedSteps: OrderProgressBarState['lastTimeChangedSteps'],
  previousStepName: OrderProgressBarState['previousStepName']
) {
  const setProgressBarStepName = useSetExecutingOrderProgressBarStepNameCallback()

  const stepName = getProgressBarStepName(
    isUnfillable,
    isCancelled,
    isExpired,
    isCancelling,
    cancellationTriggered,
    isConfirmed,
    countdown,
    backendApiStatus,
    previousStepName
  )

  // Update state with new step name
  useEffect(() => {
    function updateStepName(name: OrderProgressBarStepName) {
      setProgressBarStepName(orderId, name || 'initial')
    }

    let timer: NodeJS.Timeout

    const timeSinceLastChange = lastTimeChangedSteps ? Date.now() - lastTimeChangedSteps : 0

    if (lastTimeChangedSteps === undefined || timeSinceLastChange >= MINIMUM_STEP_DISPLAY_TIME) {
      updateStepName(stepName)

      // schedule update for temporary steps
      if (stepName === 'submissionFailed' || stepName === 'nextBatch') {
        timer = setTimeout(() => updateStepName('solving'), MINIMUM_STEP_DISPLAY_TIME)
      }
    } else {
      // Delay if it was updated less than MINIMUM_STEP_DISPLAY_TIME ago
      timer = setTimeout(() => updateStepName(stepName), MINIMUM_STEP_DISPLAY_TIME - timeSinceLastChange)
    }

    return () => {
      clearInterval(timer)
    }
  }, [orderId, stepName, lastTimeChangedSteps])
}

function getProgressBarStepName(
  isUnfillable: boolean,
  isCancelled: boolean,
  isExpired: boolean,
  isCancelling: boolean,
  cancellationTriggered: undefined | true,
  isConfirmed: boolean,
  countdown: OrderProgressBarState['countdown'],
  backendApiStatus: OrderProgressBarState['backendApiStatus'],
  previousStepName: OrderProgressBarState['previousStepName']
): OrderProgressBarStepName {
  if (isExpired) {
    return 'expired'
  } else if (isCancelled) {
    return 'cancelled'
  } else if (isCancelling) {
    return 'cancelling'
  } else if (cancellationTriggered && (backendApiStatus === 'traded' || isConfirmed)) {
    // Was cancelling, but got executed in the meantime
    return 'cancellationFailed'
  } else if (isConfirmed) {
    // already traded
    return 'finished'
  } else if (
    previousStepName === 'executing' &&
    (backendApiStatus === 'active' || backendApiStatus === 'open' || backendApiStatus === 'scheduled')
  ) {
    // moved back from executing to active
    return 'submissionFailed'
  } else if (
    previousStepName === 'solved' &&
    (backendApiStatus === 'active' || backendApiStatus === 'open' || backendApiStatus === 'scheduled')
  ) {
    // moved back from solving to active
    return 'nextBatch'
  }
  if (isUnfillable) {
    // out of market order
    return 'unfillable'
  } else if (backendApiStatus === 'active' && countdown === 0) {
    // solving, but took longer than stipulated countdown
    return 'delayed'
  } else if (backendApiStatus) {
    // straight mapping API status to progress bar steps
    return BACKEND_TYPE_TO_PROGRESS_BAR_STEP_NAME[backendApiStatus]
  }

  return 'initial'
}

const BACKEND_TYPE_TO_PROGRESS_BAR_STEP_NAME: Record<CompetitionOrderStatus.type, OrderProgressBarStepName> = {
  scheduled: 'initial',
  open: 'initial',
  active: 'solving',
  solved: 'solved',
  executing: 'executing',
  traded: 'finished',
  cancelled: 'initial', // TODO: maybe add another state for finished with error?
}

function useBackendApiStatusUpdater(chainId: SupportedChainId, orderId: string, doNotQuery: boolean) {
  const setAtom = useSetAtom(updateOrderProgressBarBackendInfo)
  const { type: backendApiStatus, value: solverCompetition } = usePendingOrderStatus(chainId, orderId, doNotQuery) || {}

  useEffect(() => {
    if (orderId && (backendApiStatus || solverCompetition)) {
      setAtom({ orderId, value: { backendApiStatus, solverCompetition } })
    }
  }, [orderId, setAtom, backendApiStatus, solverCompetition])
}

const POOLING_SWR_OPTIONS = {
  refreshInterval: ms`1s`,
}

function usePendingOrderStatus(chainId: SupportedChainId, orderId: string, doNotQuery?: boolean) {
  return useSWR(
    chainId && orderId && !doNotQuery ? ['getOrderCompetitionStatus', chainId, orderId] : null,
    async ([, _chainId, _orderId]) => getOrderCompetitionStatus(_chainId, _orderId),
    doNotQuery ? SWR_NO_REFRESH_OPTIONS : POOLING_SWR_OPTIONS
  ).data
}
