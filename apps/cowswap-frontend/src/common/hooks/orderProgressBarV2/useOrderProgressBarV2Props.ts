import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { SolverInfo, useSolversInfo } from '@cowprotocol/core'
import { CompetitionOrderStatus, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useENS } from '@cowprotocol/ens'
import { Command } from '@cowprotocol/types'

import ms from 'ms.macro'
import useSWR from 'swr'

import { useActivityDerivedState } from 'legacy/hooks/useActivityDerivedState'
import { useMultipleActivityDescriptors } from 'legacy/hooks/useRecentActivity'
import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { ActivityDerivedState } from 'modules/account/containers/Transaction'
import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { getOrderCompetitionStatus } from 'api/cowProtocol/api'
import { useCancelOrder } from 'common/hooks/useCancelOrder'
import { featureFlagsAtom } from 'common/state/featureFlagsState'
import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'

import {
  ordersProgressBarStateAtom,
  setOrderProgressBarCancellationTriggered,
  updateOrderProgressBarBackendInfo,
  updateOrderProgressBarCountdown,
  updateOrderProgressBarStepName,
} from './atoms'
import { ApiSolverCompetition, OrderProgressBarState, OrderProgressBarStepName, SolverCompetition } from './types'

import { useGetSurplusData } from '../useGetSurplusFiatValue'

export type UseOrderProgressBarPropsParams = {
  activityDerivedState: ActivityDerivedState | null
  chainId: SupportedChainId
}

export type UseOrderProgressBarV2Result = Pick<OrderProgressBarState, 'countdown'> & {
  stepName: Exclude<OrderProgressBarState['progressBarStepName'], undefined>
  showCancellationModal: Command | null
  solverCompetition?: SolverCompetition[]
  totalSolvers: number
}

const MINIMUM_STEP_DISPLAY_TIME = ms`5s`
export const PROGRESS_BAR_TIMER_DURATION = 15 // in seconds

/**
 * Hook for fetching ProgressBarV2 props
 */
export function useOrderProgressBarV2Props(chainId: SupportedChainId, order: Order | undefined) {
  const orderId = order?.id
  const [activity] = useMultipleActivityDescriptors({ chainId, ids: orderId ? [orderId] : [] })
  const activityDerivedState = useActivityDerivedState({ chainId, activity })
  const progressBarV2Props = useOrderBaseProgressBarV2Props({ chainId, activityDerivedState })

  const getCancellation = useCancelOrder()
  const showCancellationModal = useMemo(
    // Sort of duplicate cancellation logic since ethflow on creating state don't have progress bar props
    () => progressBarV2Props?.showCancellationModal || (order && getCancellation ? getCancellation(order) : null),
    [progressBarV2Props?.showCancellationModal, order, getCancellation]
  )
  const surplusData = useGetSurplusData(order)
  const receiverEnsName = useENS(order?.receiver).name || undefined

  return useMemo(() => {
    // Add supplementary stuff
    const data = {
      ...progressBarV2Props,
      activityDerivedState,
      surplusData,
      chainId,
      receiverEnsName,
      showCancellationModal,
      isProgressBarSetup: true,
    }

    if (!progressBarV2Props) {
      // Not setup, progress bar shouldn't be displayed, but cancellation still needed for ethflow
      return { ...data, isProgressBarSetup: false }
    }
    return data
  }, [progressBarV2Props, activityDerivedState, surplusData, chainId, receiverEnsName, showCancellationModal])
}

function useOrderBaseProgressBarV2Props(
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
    isFailed = false,
  } = activityDerivedState || {}

  const { disableProgressBar: widgetDisabled = false } = useInjectedWidgetParams()
  const { disableProgressBar: featureFlagDisabled } = useAtomValue(featureFlagsAtom)

  // Do not build progress bar data when these conditions are set
  const disableProgressBar = widgetDisabled || isCreating || isFailed || isPresignaturePending || featureFlagDisabled

  const orderId = order?.id || ''

  const getCancelOrder = useCancelOrder()
  const showCancellationModal = order && getCancelOrder ? getCancelOrder(order) : null

  // Fetch state from atom
  const {
    countdown,
    backendApiStatus,
    previousBackendApiStatus,
    solverCompetition: apiSolverCompetition,
    progressBarStepName,
    previousStepName,
    lastTimeChangedSteps,
    cancellationTriggered,
  } = useGetExecutingOrderState(orderId)

  const solversInfo = useSolversInfo(chainId)
  const totalSolvers = Object.keys(solversInfo).length

  const doNotQuery = getDoNotQueryStatusEndpoint(order, apiSolverCompetition, disableProgressBar)

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
    previousBackendApiStatus,
    lastTimeChangedSteps,
    previousStepName
  )
  useCancellingOrderUpdater(orderId, isCancelling)
  useCountdownStartUpdater(orderId, countdown, backendApiStatus)

  const solverCompetition = useMemo(
    () =>
      apiSolverCompetition
        ?.map((entry) => mergeSolverData(entry, solversInfo))
        // Reverse it since backend returns the solutions ranked ascending. Winner is the last one.
        .reverse(),
    [apiSolverCompetition, solversInfo]
  )

  return useMemo(() => {
    if (disableProgressBar) {
      return undefined
    }

    return {
      countdown,
      totalSolvers,
      solverCompetition,
      stepName: progressBarStepName || 'initial',
      showCancellationModal,
    }
  }, [disableProgressBar, countdown, totalSolvers, solverCompetition, progressBarStepName, showCancellationModal])
}

/**
 * Returns whether to pool backend's /status endpoint for given order
 *
 * @param order
 * @param apiSolverCompetition
 * @param disableProgressBar
 */
function getDoNotQueryStatusEndpoint(
  order: Order | undefined,
  apiSolverCompetition: CompetitionOrderStatus['value'] | undefined,
  disableProgressBar: boolean
) {
  return (
    !!(
      (
        order && // when the order exists
        getIsFinalizedOrder(order) && // and it's already in a final state
        (order.status !== OrderStatus.FULFILLED || // when in a state other than fulfilled (cancelled, expired)
          apiSolverCompetition)
      ) // or the solver competition data is present
    ) || disableProgressBar // or the progress bar is completely disabled
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
      setCountdown(orderId, PROGRESS_BAR_TIMER_DURATION)
    } else if (backendApiStatus !== 'active' && countdown) {
      // Every time backend status is not `active` and countdown is set, reset the countdown
      setCountdown(orderId, null)
    }
  }, [backendApiStatus, setCountdown, countdown, orderId])
}

function useCancellingOrderUpdater(orderId: string, isCancelling: boolean) {
  const setCancellationTriggered = useSetAtom(setOrderProgressBarCancellationTriggered)

  useEffect(() => {
    if (isCancelling) setCancellationTriggered(orderId)
  }, [orderId, isCancelling, setCancellationTriggered])
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
  previousBackendApiStatus: OrderProgressBarState['previousBackendApiStatus'],
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
    previousBackendApiStatus,
    previousStepName
  )

  // Update state with new step name
  useEffect(() => {
    function updateStepName(name: OrderProgressBarStepName) {
      setProgressBarStepName(orderId, name || 'initial')
    }

    let timer: NodeJS.Timeout

    const timeSinceLastChange = lastTimeChangedSteps ? Date.now() - lastTimeChangedSteps : 0

    if (
      lastTimeChangedSteps === undefined ||
      timeSinceLastChange >= MINIMUM_STEP_DISPLAY_TIME ||
      stepName === 'finished' ||
      stepName === 'cancellationFailed' ||
      stepName === 'cancelled' ||
      stepName === 'expired'
    ) {
      updateStepName(stepName)

      // schedule update for temporary steps
      if (stepName === 'submissionFailed') {
        timer = setTimeout(() => updateStepName('solving'), MINIMUM_STEP_DISPLAY_TIME)
      }
    } else {
      // Delay if it was updated less than MINIMUM_STEP_DISPLAY_TIME ago
      timer = setTimeout(() => updateStepName(stepName), MINIMUM_STEP_DISPLAY_TIME - timeSinceLastChange)
    }

    return () => {
      clearInterval(timer)
    }
  }, [orderId, stepName, lastTimeChangedSteps, setProgressBarStepName])
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
  previousBackendApiStatus: OrderProgressBarState['previousBackendApiStatus'],
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
    previousBackendApiStatus === 'executing' &&
    (backendApiStatus === 'active' || backendApiStatus === 'open' || backendApiStatus === 'scheduled')
  ) {
    // moved back from executing to active
    return 'submissionFailed'
  } else if (isUnfillable) {
    // out of market order
    return 'unfillable'
  } else if (backendApiStatus === 'active' && countdown === 0) {
    // solving, but took longer than stipulated countdown
    return 'delayed'
  } else if (
    (backendApiStatus === 'open' || backendApiStatus === 'scheduled') &&
    previousStepName &&
    previousStepName !== 'initial'
  ) {
    // once moved out of initial state, never go back to it
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

/**
 * Merges solverCompetition data returned by the orderbook /status endpoint with
 * solver info fetched from CMS
 *
 * @param solverCompetition
 * @param solversInfo
 */
function mergeSolverData(
  solverCompetition: ApiSolverCompetition,
  solversInfo: Record<string, SolverInfo>
): SolverCompetition {
  // Backend has the prefix `-solve` on some solvers. We should discard that for now.
  // In the future this prefix will be removed.
  const solverId = solverCompetition.solver.replace(/-solve$/, '')
  const solverInfo = solversInfo[solverId]

  return { ...solverCompetition, ...solverInfo, solverId, solver: solverId }
}
