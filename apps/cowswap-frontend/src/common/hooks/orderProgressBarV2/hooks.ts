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
  executingOrdersCountdownAtom,
  executingOrdersStateAtom,
  updateSingleExecutingOrderBackendInfo,
  updateSingleExecutingOrderCountdown,
  updateSingleExecutingOrderProgressBarStepName,
} from './atoms'
import { ExecutingOrderState, OrderProgressBarStepName } from './types'

export function useGetExecutingOrderCountdown(orderId: string | undefined) {
  const allCountdowns = useAtomValue(executingOrdersCountdownAtom)

  const countdown = orderId ? allCountdowns[orderId] : undefined

  return useMemo(() => countdown, [countdown])
}

export function useGetExecutingOrderState(orderId: string): ExecutingOrderState {
  const fullState = useAtomValue(executingOrdersStateAtom)
  const singleState = fullState[orderId]

  return useMemo(() => singleState || {}, [singleState])
}

export function useSetExecutingOrderCountdownCallback() {
  const setAtom = useSetAtom(updateSingleExecutingOrderCountdown)

  return useCallback((orderId: string, value: number | null) => setAtom({ orderId, value }), [setAtom])
}

export function useSetExecutingOrderProgressBarStepNameCallback() {
  const setValue = useSetAtom(updateSingleExecutingOrderProgressBarStepName)

  return useCallback((orderId: string, value: OrderProgressBarStepName) => setValue({ orderId, value }), [setValue])
}

export type UseOrderProgressBarPropsParams = {
  activityDerivedState: ActivityDerivedState | null
  chainId: SupportedChainId
}

export function useOrderProgressBarProps(params: UseOrderProgressBarPropsParams) {
  const { activityDerivedState, chainId } = params

  const { order, isConfirmed = false, isUnfillable = false } = activityDerivedState || {}
  // Whether the order is in a final state, to avoid querying backend after
  const isFinal = !!(order && getIsFinalizedOrder(order))

  const orderId = order?.id || ''

  // Fetch state from atom
  const { countdown, backendApiStatus, solverCompetition, progressBarStepName } = useGetExecutingOrderState(orderId)

  // Local updaters
  useBackendApiStatusUpdater(chainId, orderId, isFinal)
  useProgressBarStepNameUpdater(orderId, isUnfillable, isConfirmed, countdown, backendApiStatus)
  useCountdownStartUpdater(orderId, countdown, backendApiStatus)

  return useMemo(
    () => ({ countdown, solverCompetition, stepName: progressBarStepName || 'initial', order }),
    [countdown, solverCompetition, progressBarStepName, order]
  )
}

function useCountdownStartUpdater(
  orderId: string,
  countdown: ExecutingOrderState['countdown'],
  backendApiStatus: ExecutingOrderState['backendApiStatus']
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
  countdown: ExecutingOrderState['countdown'],
  backendApiStatus: ExecutingOrderState['backendApiStatus']
) {
  const setProgressBarStepName = useSetExecutingOrderProgressBarStepNameCallback()

  const stepName = getProgressBarStepName(isUnfillable, isConfirmed, countdown, backendApiStatus)

  useEffect(() => {
    setProgressBarStepName(orderId, stepName)
  }, [setProgressBarStepName, orderId, stepName])
}

function getProgressBarStepName(
  isUnfillable: boolean,
  isConfirmed: boolean,
  countdown: ExecutingOrderState['countdown'],
  backendApiStatus: ExecutingOrderState['backendApiStatus']
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
    return PENDING_ORDER_STATUS_TYPE_TO_PROGRESS_BAR_STEP_NAME[backendApiStatus]
  }

  return 'initial'
}

const PENDING_ORDER_STATUS_TYPE_TO_PROGRESS_BAR_STEP_NAME: Record<PendingOrderStatusType, OrderProgressBarStepName> = {
  scheduled: 'initial',
  open: 'initial',
  active: 'solving',
  executing: 'executing',
  solved: 'executing',
  traded: 'finished',
  cancelled: 'initial', // TODO: maybe add another state for finished with error?
}

export function useBackendApiStatusUpdater(chainId: SupportedChainId, orderId: string, isFinal: boolean) {
  const update = useSetAtom(updateSingleExecutingOrderBackendInfo)
  const { type: backendApiStatus, value: solverCompetition } = usePendingOrderStatus(chainId, orderId, isFinal) || {}

  useEffect(() => {
    if (orderId && (backendApiStatus || solverCompetition)) {
      update({ orderId, value: { backendApiStatus, solverCompetition } })
    }
  }, [orderId, update, backendApiStatus, solverCompetition])
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
