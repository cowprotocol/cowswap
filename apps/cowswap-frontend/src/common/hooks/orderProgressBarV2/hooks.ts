import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'
import useSWR from 'swr'

import { ActivityDerivedState } from 'modules/account/containers/Transaction'

import { getPendingOrderStatus, PendingOrderStatusType, SolverCompetition } from 'api/cowProtocol/api'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { usePrevious } from '@cowprotocol/common-hooks'
import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'
import {
  executingOrdersCountdownAtom,
  executingOrdersStateAtom,
  updateSingleExecutingOrderBackendInfo,
  updateSingleExecutingOrderCountdown,
} from './atoms'
import { ExecutingOrderState, OrderProgressBarStepName } from './types'

export function useGetExecutingOrderCountdownCallback() {
  const allCountdowns = useAtomValue(executingOrdersCountdownAtom)

  return useCallback(
    (orderId: string) => {
      return allCountdowns[orderId]
    },
    [allCountdowns]
  )
}

export function useGetExecutingOrderCountdown(orderId: string | undefined) {
  const allCountdowns = useAtomValue(executingOrdersCountdownAtom)

  return useMemo(() => {
    if (!orderId) {
      return undefined
    }

    return allCountdowns[orderId]
  }, [allCountdowns, orderId])
}

export function useGetExecutingOrderState(orderId: string): ExecutingOrderState | undefined {
  const fullState = useAtomValue(executingOrdersStateAtom)
  const singleState = fullState[orderId]

  return useMemo(() => singleState, [singleState])
}

export function useSetExecutingOrderCountdownCallback() {
  const setCountdown = useSetAtom(updateSingleExecutingOrderCountdown)

  return useCallback((orderId: string, value: number | null) => setCountdown({ orderId, value }), [setCountdown])
}

export type UseOrderProgressBarPropsParams = {
  activityDerivedState: ActivityDerivedState | null
  chainId: SupportedChainId
}

export function useOrderProgressBarProps(params: UseOrderProgressBarPropsParams) {
  const { activityDerivedState, chainId } = params

  const { order, isConfirmed = false, isUnfillable = false } = activityDerivedState || {}
  const isFinal = !!(order && getIsFinalizedOrder(order))

  // Updater to pool backend api, to run only when this hook is instantiated
  useBackendApiStatusUpdater(chainId, order ? order.id : '', isFinal)

  const state = useProgressBarState(order?.id || '', isUnfillable, isConfirmed)

  return useMemo(() => ({ ...state, order }), [state, order])
}

export type ProgressBarState = {
  stepName: OrderProgressBarStepName
  solverCompetition?: SolverCompetition
  countdown?: number | null | undefined
}

function useProgressBarState(orderId: string, isUnfillable: boolean, isConfirmed: boolean): ProgressBarState {
  const setCountdown = useSetExecutingOrderCountdownCallback()
  const { countdown, backendApiStatus, solverCompetition } = useGetExecutingOrderState(orderId) || {}

  const prevOrderStatusType = usePrevious(backendApiStatus)

  // Maybe this shouldn't be in this hook
  useEffect(() => {
    if (!countdown && backendApiStatus === 'active' && prevOrderStatusType !== 'active') {
      // Start countdown when it becomes active
      setCountdown(orderId, 16)
    } else if (backendApiStatus !== 'active' && prevOrderStatusType === 'active') {
      // clear countdown when it's no longer active
      setCountdown(orderId, null)
    }
  }, [backendApiStatus, prevOrderStatusType, setCountdown, countdown])

  return useMemo(() => {
    if (isUnfillable) {
      // out of market order
      return { stepName: 'unfillable' }
    } else if (isConfirmed) {
      // already traded
      return { stepName: 'finished', countdown, solverCompetition }
    } else if (backendApiStatus === 'active' && countdown === 0) {
      // solving, but took longer than stipulated countdown
      return { stepName: 'delayed' }
    } else if (backendApiStatus) {
      // straight mapping API status to progress bar steps
      return {
        stepName: PENDING_ORDER_STATUS_TYPE_TO_PROGRESS_BAR_STEP_NAME[backendApiStatus],
        countdown,
        solverCompetition,
      }
    }

    return { stepName: 'initial' }
  }, [isUnfillable, backendApiStatus, isConfirmed, countdown, solverCompetition])
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

export function useBackendApiStatusUpdater(chainId: SupportedChainId, orderId: string, isFinal: boolean): null {
  const update = useSetAtom(updateSingleExecutingOrderBackendInfo)
  const { type: backendApiStatus, value: solverCompetition } = usePendingOrderStatus(chainId, orderId, isFinal) || {}

  useEffect(() => {
    if (orderId && (backendApiStatus || solverCompetition)) {
      update({ orderId, value: { backendApiStatus, solverCompetition } })
    }
  }, [orderId, update, backendApiStatus, solverCompetition])

  return null
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
