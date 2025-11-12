import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { SolverInfo } from '@cowprotocol/core'
import { CompetitionOrderStatus, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useENS } from '@cowprotocol/ens'
import { Command } from '@cowprotocol/types'

import ms from 'ms.macro'
import useSWR from 'swr'

import { useActivityDerivedState } from 'legacy/hooks/useActivityDerivedState'
import { useMultipleActivityDescriptors } from 'legacy/hooks/useRecentActivity'
import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { type SwapAndBridgeContext, SwapAndBridgeStatus } from 'modules/bridge'
import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { getOrderCompetitionStatus } from 'api/cowProtocol/api'
import { useCancelOrder } from 'common/hooks/useCancelOrder'
import { useGetSurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { useSolversInfo } from 'common/hooks/useSolversInfo'
import { useSwapAndBridgeContext } from 'common/hooks/useSwapAndBridgeContext'
import { featureFlagsAtom } from 'common/state/featureFlagsState'
import { ActivityDerivedState } from 'common/types/activity'
import { ApiSolverCompetition, SolverCompetition } from 'common/types/soverCompetition'
import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'

import { DEFAULT_STEP_NAME, OrderProgressBarStepName } from '../constants'
import {
  ordersProgressBarStateAtom,
  setOrderProgressBarCancellationTriggered,
  updateOrderProgressBarBackendInfo,
  updateOrderProgressBarCountdown,
  updateOrderProgressBarStepName,
} from '../state/atoms'
import { OrderProgressBarProps, OrderProgressBarState } from '../types'

type UseOrderProgressBarPropsParams = {
  activityDerivedState: ActivityDerivedState | null
  chainId: SupportedChainId
  isBridgingTrade: boolean
}

export type UseOrderProgressBarResult = Pick<OrderProgressBarState, 'countdown'> & {
  stepName: Exclude<OrderProgressBarState['progressBarStepName'], undefined>
  showCancellationModal: Command | null
  solverCompetition?: SolverCompetition[]
  totalSolvers: number
  swapAndBridgeContext?: SwapAndBridgeContext
}

const MINIMUM_STEP_DISPLAY_TIME = ms`5s`
export const PROGRESS_BAR_TIMER_DURATION = 15 // in seconds

/**
 * Hook for fetching ProgressBar props
 * TODO FIXME: refactor this
 */
export function useOrderProgressBarProps(
  chainId: SupportedChainId,
  order: Order | undefined,
): {
  props: OrderProgressBarProps
  activityDerivedState: ActivityDerivedState | null
} {
  const orderId = order?.id
  const isBridgingTrade = !!order && order.inputToken.chainId !== order.outputToken.chainId

  const [activity] = useMultipleActivityDescriptors({ chainId, ids: orderId ? [orderId] : [] })
  const activityDerivedState = useActivityDerivedState({ chainId, activity })

  const progressBarProps = useOrderBaseProgressBarProps({
    chainId,
    activityDerivedState,
    isBridgingTrade,
  })

  const getCancellation = useCancelOrder()
  const showCancellationModal = useMemo(
    // Sort of duplicate cancellation logic since ethflow on creating state don't have progress bar props
    () => progressBarProps?.showCancellationModal || (order && getCancellation ? getCancellation(order) : null),
    [progressBarProps?.showCancellationModal, order, getCancellation],
  )

  const surplusData = useGetSurplusData(order)
  const receiverEnsName = useENS(order?.receiver).name || undefined

  const props = useMemo(() => {
    // Add supplementary stuff
    const data: OrderProgressBarProps = {
      ...progressBarProps,
      surplusData,
      chainId,
      receiverEnsName,
      showCancellationModal,
      isProgressBarSetup: true,
      isBridgingTrade,
    }

    if (!progressBarProps) {
      // Not setup, progress bar shouldn't be displayed, but cancellation still needed for ethflow
      return { ...data, isProgressBarSetup: false }
    }
    return data
  }, [progressBarProps, surplusData, chainId, receiverEnsName, showCancellationModal, isBridgingTrade])

  return useMemo(() => ({ props, activityDerivedState }), [props, activityDerivedState])
}

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
function useOrderBaseProgressBarProps(params: UseOrderProgressBarPropsParams): UseOrderProgressBarResult | undefined {
  const { activityDerivedState, chainId, isBridgingTrade } = params

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

  const orderId = order?.id

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

  const doNotQuery = getDoNotQueryStatusEndpoint(order, apiSolverCompetition, !!disableProgressBar)

  const winnerSolver = useMemo(
    () => (apiSolverCompetition?.[0] ? mergeSolverData(apiSolverCompetition[0], solversInfo) : undefined),
    [apiSolverCompetition, solversInfo],
  )
  const { swapAndBridgeContext } = useSwapAndBridgeContext(chainId, isBridgingTrade ? order : undefined, winnerSolver)
  const bridgingStatus = swapAndBridgeContext?.bridgingStatus

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
    previousStepName,
    bridgingStatus,
    isBridgingTrade,
  )
  useCancellingOrderUpdater(orderId, isCancelling)
  useCountdownStartUpdater(orderId, countdown, backendApiStatus, isUnfillable || isCancelled || isCancelling || isExpired)

  const solverCompetition = useMemo(() => {
    const solversMap = apiSolverCompetition?.reduce(
      (acc, entry) => {
        // If the entry is not a valid or has no executedAmounts, the solution doesn't consider this order, skip it
        if (!entry || !entry.solver || !entry.executedAmounts) {
          return acc
        }
        // Merge the solver competition data with the info fetched from CMS under the same key, to avoid duplicates
        acc[entry.solver] = mergeSolverData(entry, solversInfo)
        return acc
      },
      {} as Record<string, SolverCompetition>,
    )

    return (
      Object.values(solversMap || {})
        // Reverse it since backend returns the solutions ranked ascending. Winner is the last one.
        .reverse()
    )
  }, [apiSolverCompetition, solversInfo])

  return useMemo(() => {
    if (disableProgressBar) {
      return undefined
    }

    return {
      countdown,
      totalSolvers,
      solverCompetition,
      stepName: progressBarStepName || DEFAULT_STEP_NAME,
      showCancellationModal,
      swapAndBridgeContext,
    }
  }, [
    disableProgressBar,
    countdown,
    totalSolvers,
    solverCompetition,
    progressBarStepName,
    showCancellationModal,
    swapAndBridgeContext,
  ])
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
  disableProgressBar: boolean,
): boolean {
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

const DEFAULT_STATE = {}

function useGetExecutingOrderState(orderId?: string): OrderProgressBarState {
  const fullState = useAtomValue(ordersProgressBarStateAtom)
  const singleState = orderId ? fullState[orderId] : undefined

  return useMemo(() => singleState || DEFAULT_STATE, [singleState])
}

function useSetExecutingOrderCountdownCallback(): (orderId: string, value: number | null) => void {
  const setAtom = useSetAtom(updateOrderProgressBarCountdown)

  return useCallback((orderId: string, value: number | null) => setAtom({ orderId, value }), [setAtom])
}

function useSetExecutingOrderProgressBarStepNameCallback(): (orderId: string, value: OrderProgressBarStepName) => void {
  const setValue = useSetAtom(updateOrderProgressBarStepName)

  return useCallback(
    (orderId: string, value: OrderProgressBarStepName) => {
      setValue({ orderId, value })
    },
    [setValue],
  )
}

// local updaters

function useCountdownStartUpdater(
  orderId: string | undefined,
  countdown: OrderProgressBarState['countdown'],
  backendApiStatus: OrderProgressBarState['backendApiStatus'],
  shouldDisableCountdown: boolean,
): void {
  const setCountdown = useSetExecutingOrderCountdownCallback()

  useEffect(() => {
    if (!orderId) {
      return
    }

    if (shouldDisableCountdown) {
      // Loose `!= null` on purpose: both null and undefined should reset the countdown, but 0 must stay; strict `!== null` would let undefined slip through
      if (countdown != null) {
        setCountdown(orderId, null)
      }
      return
    }

    // Start countdown immediately when backend becomes active to reflect real protocol timing
    // The solver competition genuinely starts when backend is active, regardless of UI delays
    if (countdown == null && backendApiStatus === CompetitionOrderStatus.type.ACTIVE) {
      setCountdown(orderId, PROGRESS_BAR_TIMER_DURATION)
    } else if (backendApiStatus !== CompetitionOrderStatus.type.ACTIVE && countdown != null) {
      // Every time backend status is not `active` and countdown is set, reset the countdown
      setCountdown(orderId, null)
    }
  }, [backendApiStatus, setCountdown, countdown, orderId, shouldDisableCountdown])
}

function useCancellingOrderUpdater(orderId: string | undefined, isCancelling: boolean): void {
  const setCancellationTriggered = useSetAtom(setOrderProgressBarCancellationTriggered)

  useEffect(() => {
    if (!orderId || !isCancelling) {
      return
    }

    setCancellationTriggered(orderId)
  }, [orderId, isCancelling, setCancellationTriggered])
}

// TODO: Break down this large function into smaller functions
function useProgressBarStepNameUpdater(
  orderId: string | undefined,
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
  previousStepName: OrderProgressBarState['previousStepName'],
  bridgingStatus: SwapAndBridgeStatus | undefined,
  isBridgingTrade: boolean,
): void {
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
    previousStepName,
    bridgingStatus,
    isBridgingTrade,
  )

  // Update state with new step name
  useEffect(() => {
    if (!orderId) {
      return
    }

    const ensuredOrderId = orderId

    function updateStepName(name: OrderProgressBarStepName): void {
      setProgressBarStepName(ensuredOrderId, name || DEFAULT_STEP_NAME)
    }

    let timer: NodeJS.Timeout | undefined

    const timeSinceLastChange = lastTimeChangedSteps ? Date.now() - lastTimeChangedSteps : 0

    if (
      lastTimeChangedSteps === undefined ||
      timeSinceLastChange >= MINIMUM_STEP_DISPLAY_TIME ||
      stepName === OrderProgressBarStepName.FINISHED ||
      stepName === OrderProgressBarStepName.CANCELLATION_FAILED ||
      stepName === OrderProgressBarStepName.CANCELLED ||
      stepName === OrderProgressBarStepName.EXPIRED
    ) {
      updateStepName(stepName)

      // schedule update for temporary steps
      if (stepName === OrderProgressBarStepName.SUBMISSION_FAILED) {
        timer = setTimeout(() => updateStepName(OrderProgressBarStepName.SOLVING), MINIMUM_STEP_DISPLAY_TIME)
      }
    } else {
      // Delay if it was updated less than MINIMUM_STEP_DISPLAY_TIME ago
      timer = setTimeout(() => updateStepName(stepName), MINIMUM_STEP_DISPLAY_TIME - timeSinceLastChange)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [orderId, stepName, lastTimeChangedSteps, setProgressBarStepName])
}

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export function getProgressBarStepName(
  isUnfillable: boolean,
  isCancelled: boolean,
  isExpired: boolean,
  isCancelling: boolean,
  cancellationTriggered: undefined | true,
  isConfirmed: boolean,
  countdown: OrderProgressBarState['countdown'],
  backendApiStatus: OrderProgressBarState['backendApiStatus'],
  previousBackendApiStatus: OrderProgressBarState['previousBackendApiStatus'],
  previousStepName: OrderProgressBarState['previousStepName'],
  bridgingStatus: SwapAndBridgeStatus | undefined,
  isBridgingTrade: boolean,
): OrderProgressBarStepName {
  const isTradedOrConfirmed = backendApiStatus === CompetitionOrderStatus.type.TRADED || isConfirmed

  if (bridgingStatus) {
    if (bridgingStatus === SwapAndBridgeStatus.DONE) {
      return OrderProgressBarStepName.BRIDGING_FINISHED
    }

    if (bridgingStatus === SwapAndBridgeStatus.REFUND_COMPLETE) {
      return OrderProgressBarStepName.REFUND_COMPLETED
    }

    if (bridgingStatus === SwapAndBridgeStatus.FAILED) {
      return OrderProgressBarStepName.BRIDGING_FAILED
    }

    if (bridgingStatus && [SwapAndBridgeStatus.PENDING, SwapAndBridgeStatus.DEFAULT].includes(bridgingStatus)) {
      return OrderProgressBarStepName.BRIDGING_IN_PROGRESS
    }
  }

  if (isTradedOrConfirmed && isBridgingTrade && !bridgingStatus) {
    return OrderProgressBarStepName.EXECUTING
  }

  if (isExpired) {
    return OrderProgressBarStepName.EXPIRED
  } else if (isCancelled) {
    return OrderProgressBarStepName.CANCELLED
  } else if (isCancelling) {
    return OrderProgressBarStepName.CANCELLING
  } else if (cancellationTriggered && isTradedOrConfirmed) {
    // Was cancelling, but got executed in the meantime
    return OrderProgressBarStepName.CANCELLATION_FAILED
  } else if (isConfirmed) {
    // already traded
    return OrderProgressBarStepName.FINISHED
  } else if (
    previousBackendApiStatus === CompetitionOrderStatus.type.EXECUTING &&
    (backendApiStatus === CompetitionOrderStatus.type.ACTIVE ||
      backendApiStatus === CompetitionOrderStatus.type.OPEN ||
      backendApiStatus === CompetitionOrderStatus.type.SCHEDULED)
  ) {
    // moved back from executing to active
    return OrderProgressBarStepName.SUBMISSION_FAILED
  } else if (isUnfillable) {
    // out of market order
    return OrderProgressBarStepName.UNFILLABLE
  } else if (
    (backendApiStatus == null ||
      backendApiStatus === CompetitionOrderStatus.type.OPEN ||
      backendApiStatus === CompetitionOrderStatus.type.SCHEDULED) &&
    previousStepName === OrderProgressBarStepName.UNFILLABLE
  ) {
    // Order just recovered from being unfillable but backend has not progressed yet.
    // Keep showing the solving animation so the favicon restarts instead of idling.
    return OrderProgressBarStepName.SOLVING
  } else if (backendApiStatus === CompetitionOrderStatus.type.ACTIVE && countdown === 0) {
    // solving, but took longer than stipulated countdown
    return OrderProgressBarStepName.DELAYED
  } else if (
    (backendApiStatus === CompetitionOrderStatus.type.OPEN ||
      backendApiStatus === CompetitionOrderStatus.type.SCHEDULED) &&
    previousStepName &&
    previousStepName !== OrderProgressBarStepName.INITIAL
  ) {
    // once moved out of initial state, never go back to it
    return OrderProgressBarStepName.DELAYED
  } else if (backendApiStatus) {
    // straight mapping API status to progress bar steps
    return BACKEND_TYPE_TO_PROGRESS_BAR_STEP_NAME[backendApiStatus]
  }

  return OrderProgressBarStepName.INITIAL
}

const BACKEND_TYPE_TO_PROGRESS_BAR_STEP_NAME: Record<CompetitionOrderStatus.type, OrderProgressBarStepName> = {
  [CompetitionOrderStatus.type.SCHEDULED]: OrderProgressBarStepName.INITIAL,
  [CompetitionOrderStatus.type.OPEN]: OrderProgressBarStepName.INITIAL,
  [CompetitionOrderStatus.type.ACTIVE]: OrderProgressBarStepName.SOLVING,
  [CompetitionOrderStatus.type.SOLVED]: OrderProgressBarStepName.SOLVED,
  [CompetitionOrderStatus.type.EXECUTING]: OrderProgressBarStepName.EXECUTING,
  [CompetitionOrderStatus.type.TRADED]: OrderProgressBarStepName.FINISHED,
  [CompetitionOrderStatus.type.CANCELLED]: OrderProgressBarStepName.INITIAL, // TODO: maybe add another state for finished with error?
}

function useBackendApiStatusUpdater(
  chainId: SupportedChainId,
  orderId: string | undefined,
  doNotQuery: boolean,
): void {
  const setAtom = useSetAtom(updateOrderProgressBarBackendInfo)
  const [stopQuerying, setStopQuerying] = useState(false)
  const { type: backendApiStatus, value } = usePendingOrderStatus(chainId, orderId, stopQuerying) || {}

  // Once doNotQuery is set to true, keep querying for another 3 seconds to ensure we get the final status and then stop
  useEffect(() => {
    if (doNotQuery) {
      const timer = setTimeout(() => setStopQuerying(true), ms`3s`)

      return () => {
        clearTimeout(timer)
      }
    } else {
      setStopQuerying(false) // Reset the stop querying state when doNotQuery is false

      return
    }
  }, [doNotQuery, orderId])

  useEffect(() => {
    if (orderId && (backendApiStatus || value)) {
      // Lowercase solver names as CMS might return them in different cases
      const solverCompetition = value?.map(({ solver, ...rest }) => ({
        ...rest,
        solver: solver.toLowerCase(),
      }))
      setAtom({ orderId, value: { backendApiStatus, solverCompetition } })
    }
  }, [orderId, setAtom, backendApiStatus, value])
}

const POOLING_SWR_OPTIONS = {
  refreshInterval: ms`1s`,
}

function usePendingOrderStatus(
  chainId: SupportedChainId,
  orderId: string | undefined,
  doNotQuery?: boolean,
): CompetitionOrderStatus | undefined {
  return useSWR(
    chainId && orderId && !doNotQuery ? ['getOrderCompetitionStatus', chainId, orderId] : null,
    async ([, _chainId, _orderId]) => getOrderCompetitionStatus(_chainId, _orderId),
    doNotQuery ? SWR_NO_REFRESH_OPTIONS : POOLING_SWR_OPTIONS,
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
  solversInfo: Record<string, SolverInfo>,
): SolverCompetition {
  // Backend has the prefix `-solve` on some solvers. We should discard that for now.
  // In the future this prefix will be removed.
  const solverId = solverCompetition.solver.replace(/-solve$/, '')
  const solverInfo = solversInfo[solverId.toLowerCase()]

  return { ...solverCompetition, ...solverInfo, solverId, solver: solverId }
}
