import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'
import useSWR from 'swr'

import { ActivityDerivedState } from 'modules/account/containers/Transaction'

import { getPendingOrderStatus, PendingOrderStatusType, SolverCompetition } from 'api/cowProtocol/api'

import { usePrevious } from '@cowprotocol/common-hooks'
import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'
import { executingOrderCountdownAtom, updateSingleExecutingOrderCountdown } from './atoms'
import { OrderProgressBarStepNames as OrderProgressBarStepName } from './types'

export function useGetExecutingOrderCountdownCallback() {
  const allCountdowns = useAtomValue(executingOrderCountdownAtom)

  return useCallback(
    (orderId: string) => {
      return allCountdowns[orderId]
    },
    [allCountdowns]
  )
}

export function useGetExecutingOrderCountdown(orderId: string | undefined) {
  const allCountdowns = useAtomValue(executingOrderCountdownAtom)

  return useMemo(() => {
    if (!orderId) {
      return undefined
    }

    return allCountdowns[orderId]
  }, [allCountdowns, orderId])
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

  const state = useProgressBarState(chainId, order?.id || '', isUnfillable, isConfirmed, isFinal)

  return useMemo(() => ({ ...state, order }), [state, order])
}

export type ProgressBarState = {
  stepName: OrderProgressBarStepName
  solverCompetition?: SolverCompetition
  countdown?: number | null | undefined
}

function useProgressBarState(
  chainId: SupportedChainId,
  orderId: string,
  isUnfillable: boolean,
  isConfirmed: boolean,
  isFinal: boolean
): ProgressBarState {
  const countdown = useGetExecutingOrderCountdown(orderId)
  const setCountdown = useSetExecutingOrderCountdownCallback()
  const [solverCompetition, setSolverCompetition] = useState<SolverCompetition | undefined>()

  // updated every second until isFinished
  const { type: orderStatusType, value } = usePendingOrderStatus(chainId, !isFinal ? orderId : '') || {}
  const prevOrderStatusType = usePrevious(orderStatusType)

  // Maybe this shouldn't be in this hook
  useEffect(() => {
    if (orderStatusType === 'active' && prevOrderStatusType !== 'active') {
      // Start countdown when it becomes active
      setCountdown(orderId, 15)
    } else if (orderStatusType !== 'active' && prevOrderStatusType === 'active') {
      // clear countdown when it's no longer active
      setCountdown(orderId, null)
    }
  }, [orderStatusType, prevOrderStatusType, setCountdown])

  // Store value even after we stop querying api
  useEffect(() => {
    if (value) {
      // Store whenever it exists
      setSolverCompetition(value)
    } else if (!value && orderStatusType === 'active') {
      // Reset it only when status is back to active for some reason
      setSolverCompetition(undefined)
    }
  }, [value])

  return useMemo(() => {
    if (isUnfillable) {
      // out of market order
      return { stepName: 'unfillable' }
    } else if (isConfirmed) {
      // already traded
      return { stepName: 'finished', countdown, solverCompetition }
    } else if (orderStatusType === 'active' && countdown === 0) {
      // solving, but took longer than stipulated countdown
      return { stepName: 'delayed' }
    } else if (orderStatusType) {
      // straight mapping API status to progress bar steps
      return {
        stepName: PENDING_ORDER_STATUS_TYPE_TO_PROGRESS_BAR_STEP_NAME[orderStatusType],
        countdown,
        solverCompetition,
      }
    }

    return { stepName: 'initial' }
  }, [isUnfillable, orderStatusType, isConfirmed, countdown, solverCompetition])
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

const SWR_OPTIONS = {
  refreshInterval: ms`1s`,
}

function usePendingOrderStatus(chainId: SupportedChainId, orderId: string) {
  return useSWR(
    chainId && orderId ? ['getPendingOrderStatus', chainId, orderId] : null,
    async ([, _chainId, _orderId]) => getPendingOrderStatus(_chainId, _orderId),
    SWR_OPTIONS
  ).data
}
