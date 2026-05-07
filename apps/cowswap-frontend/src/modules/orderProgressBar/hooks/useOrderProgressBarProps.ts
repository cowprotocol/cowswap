import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { SolverInfo } from '@cowprotocol/core'
import { CompetitionOrderStatus, OrderClass, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useENS } from '@cowprotocol/ens'
import { Command } from '@cowprotocol/types'

import ms from 'ms.macro'
import useSWR from 'swr'

import { useActivityDerivedState } from 'legacy/hooks/useActivityDerivedState'
import { useMultipleActivityDescriptors } from 'legacy/hooks/useRecentActivity'
import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { type SwapAndBridgeContext, SwapAndBridgeStatus } from 'modules/bridge'
import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { type OrderFillability, usePendingOrdersFillability } from 'modules/ordersTable'

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
import {
  getCompletionDelayMs,
  hasProgressBarLeftInitialStep,
  shouldShowUnfillableProgressStep,
  shouldStageExecutingStep,
} from '../updaters/utils'

export type UseOrderProgressBarResult = Pick<OrderProgressBarState, 'countdown'> & {
  stepName: Exclude<OrderProgressBarState['progressBarStepName'], undefined>
  showCancellationModal: Command | null
  solverCompetition?: SolverCompetition[]
  totalSolvers: number
  swapAndBridgeContext?: SwapAndBridgeContext
}

type UseOrderProgressBarPropsParams = {
  activityDerivedState: ActivityDerivedState | null
  chainId: SupportedChainId
  currentOrderFillability?: OrderFillability
  isBridgingTrade: boolean
}

export const MINIMUM_STEP_DISPLAY_TIME = ms`5s`
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
  const pendingOrdersFillability = usePendingOrdersFillability(OrderClass.MARKET)
  const currentOrderFillability = order?.id ? pendingOrdersFillability[order.id] : undefined

  return useOrderProgressBarPropsWithFillability(chainId, order, currentOrderFillability)
}

export function useOrderProgressBarPropsWithFillability(
  chainId: SupportedChainId,
  order: Order | undefined,
  currentOrderFillability: OrderFillability | undefined,
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
    currentOrderFillability,
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

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
function useOrderBaseProgressBarProps(params: UseOrderProgressBarPropsParams): UseOrderProgressBarResult | undefined {
  const { activityDerivedState, chainId, currentOrderFillability, isBridgingTrade } = params

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
    hasShownExecutingInCurrentAttempt,
  } = useGetExecutingOrderState(orderId)
  const shouldShowUnfillableStep = shouldShowUnfillableProgressStep(isUnfillable, currentOrderFillability)

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
    shouldShowUnfillableStep,
    isCancelled,
    isExpired,
    isCancelling,
    cancellationTriggered,
    isConfirmed,
    countdown,
    progressBarStepName,
    backendApiStatus,
    previousBackendApiStatus,
    lastTimeChangedSteps,
    previousStepName,
    hasShownExecutingInCurrentAttempt,
    bridgingStatus,
    isBridgingTrade,
  )
  useCancellingOrderUpdater(orderId, isCancelling)
  useCountdownStartUpdater(
    orderId,
    countdown,
    backendApiStatus,
    shouldShowUnfillableStep || isCancelled || isCancelling || isExpired,
  )

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

const DEFAULT_STATE = {}

function getCompletionStepName(
  currentStepName: OrderProgressBarState['progressBarStepName'],
  hasShownExecutingInCurrentAttempt: OrderProgressBarState['hasShownExecutingInCurrentAttempt'],
  isConfirmed: boolean,
  backendApiStatus: OrderProgressBarState['backendApiStatus'],
): OrderProgressBarStepName | undefined {
  if (!isConfirmed && backendApiStatus !== CompetitionOrderStatus.type.TRADED) {
    return undefined
  }

  // Completion can arrive without a visible backend `executing` poll, so we synthesize step 3
  // when the current attempt has not shown it yet before moving to the final state.
  return shouldStageExecutingStep(currentStepName, OrderProgressBarStepName.FINISHED, hasShownExecutingInCurrentAttempt)
    ? OrderProgressBarStepName.EXECUTING
    : OrderProgressBarStepName.FINISHED
}

function isSubmissionFailedStatusTransition(
  previousBackendApiStatus: OrderProgressBarState['previousBackendApiStatus'],
  backendApiStatus: OrderProgressBarState['backendApiStatus'],
): boolean {
  return (
    previousBackendApiStatus === CompetitionOrderStatus.type.EXECUTING &&
    (backendApiStatus === CompetitionOrderStatus.type.ACTIVE ||
      backendApiStatus === CompetitionOrderStatus.type.OPEN ||
      backendApiStatus === CompetitionOrderStatus.type.SCHEDULED)
  )
}

// eslint-disable-next-line complexity
export function getProgressBarStepName(
  isUnfillable: boolean,
  isCancelled: boolean,
  isExpired: boolean,
  isCancelling: boolean,
  cancellationTriggered: undefined | true,
  isConfirmed: boolean,
  countdown: OrderProgressBarState['countdown'],
  currentStepName: OrderProgressBarState['progressBarStepName'],
  backendApiStatus: OrderProgressBarState['backendApiStatus'],
  previousBackendApiStatus: OrderProgressBarState['previousBackendApiStatus'],
  previousStepName: OrderProgressBarState['previousStepName'],
  hasShownExecutingInCurrentAttempt: OrderProgressBarState['hasShownExecutingInCurrentAttempt'],
  bridgingStatus: SwapAndBridgeStatus | undefined,
  isBridgingTrade: boolean,
): OrderProgressBarStepName {
  const isTradedOrConfirmed = backendApiStatus === CompetitionOrderStatus.type.TRADED || isConfirmed
  const hasMovedPastInitialStep = !!currentStepName && currentStepName !== OrderProgressBarStepName.INITIAL
  const bridgingStepName = getBridgingStepName(bridgingStatus)
  const completionStepName = getCompletionStepName(
    currentStepName,
    hasShownExecutingInCurrentAttempt,
    isConfirmed,
    backendApiStatus,
  )

  if (shouldStageExecutingStep(currentStepName, bridgingStepName, hasShownExecutingInCurrentAttempt)) {
    return OrderProgressBarStepName.EXECUTING
  }

  if (bridgingStepName) {
    return bridgingStepName
  }

  if (isTradedOrConfirmed && isBridgingTrade && !bridgingStatus) {
    const persistedBridgingStepName = getPersistedBridgingStepName(currentStepName)

    if (persistedBridgingStepName) {
      return persistedBridgingStepName
    }

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
  } else if (completionStepName) {
    return completionStepName
  } else if (isSubmissionFailedStatusTransition(previousBackendApiStatus, backendApiStatus)) {
    // Submission failed and the backend is searching again. Show the retry screen first;
    // if this attempt later completes, step 3 will be replayed before the final state.
    return OrderProgressBarStepName.SUBMISSION_FAILED
  } else if (isUnfillable) {
    // A local unfillable flag can race immediately after approval / permit updates.
    // Keep the first visible screen on step 1 until the bar has actually advanced.
    return hasProgressBarLeftInitialStep(currentStepName)
      ? OrderProgressBarStepName.UNFILLABLE
      : OrderProgressBarStepName.INITIAL
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
    hasMovedPastInitialStep
  ) {
    // once moved out of initial state, never go back to it
    return OrderProgressBarStepName.DELAYED
  } else if (backendApiStatus) {
    // straight mapping API status to progress bar steps
    return BACKEND_TYPE_TO_PROGRESS_BAR_STEP_NAME[backendApiStatus]
  }

  return OrderProgressBarStepName.INITIAL
}

function getCompletionTargetStepName(
  isConfirmed: boolean,
  backendApiStatus: OrderProgressBarState['backendApiStatus'],
  bridgingStatus: SwapAndBridgeStatus | undefined,
): OrderProgressBarStepName | undefined {
  const bridgingStepName = getBridgingStepName(bridgingStatus)

  if (bridgingStepName) {
    return bridgingStepName
  }

  if (isConfirmed || backendApiStatus === CompetitionOrderStatus.type.TRADED) {
    return OrderProgressBarStepName.FINISHED
  }

  return undefined
}

export function shouldApplyCompletionDrivenExecutingImmediately(
  stepName: OrderProgressBarStepName,
  currentStepName: OrderProgressBarState['progressBarStepName'],
  hasShownExecutingInCurrentAttempt: OrderProgressBarState['hasShownExecutingInCurrentAttempt'],
  isConfirmed: boolean,
  backendApiStatus: OrderProgressBarState['backendApiStatus'],
  bridgingStatus: SwapAndBridgeStatus | undefined,
  isBridgingTrade: boolean,
): boolean {
  if (
    stepName !== OrderProgressBarStepName.EXECUTING ||
    !currentStepName ||
    currentStepName === OrderProgressBarStepName.EXECUTING
  ) {
    return false
  }

  const completionTargetStepName = getCompletionTargetStepName(isConfirmed, backendApiStatus, bridgingStatus)

  if (shouldStageExecutingStep(currentStepName, completionTargetStepName, hasShownExecutingInCurrentAttempt)) {
    return true
  }

  const isTradedOrConfirmed = backendApiStatus === CompetitionOrderStatus.type.TRADED || isConfirmed

  return isTradedOrConfirmed && isBridgingTrade && !bridgingStatus
}

function getBridgingStepName(bridgingStatus: SwapAndBridgeStatus | undefined): OrderProgressBarStepName | undefined {
  if (!bridgingStatus) {
    return undefined
  }

  if (bridgingStatus === SwapAndBridgeStatus.DONE) {
    return OrderProgressBarStepName.BRIDGING_FINISHED
  }

  if (bridgingStatus === SwapAndBridgeStatus.REFUND_COMPLETE) {
    return OrderProgressBarStepName.REFUND_COMPLETED
  }

  if (bridgingStatus === SwapAndBridgeStatus.FAILED) {
    return OrderProgressBarStepName.BRIDGING_FAILED
  }

  if ([SwapAndBridgeStatus.PENDING, SwapAndBridgeStatus.DEFAULT].includes(bridgingStatus)) {
    return OrderProgressBarStepName.BRIDGING_IN_PROGRESS
  }

  return undefined
}

function getPersistedBridgingStepName(
  currentStepName: OrderProgressBarState['progressBarStepName'],
): OrderProgressBarStepName | undefined {
  if (
    currentStepName === OrderProgressBarStepName.BRIDGING_IN_PROGRESS ||
    currentStepName === OrderProgressBarStepName.BRIDGING_FAILED ||
    currentStepName === OrderProgressBarStepName.REFUND_COMPLETED ||
    currentStepName === OrderProgressBarStepName.BRIDGING_FINISHED
  ) {
    return currentStepName
  }

  return undefined
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

// local updaters

function useGetExecutingOrderState(orderId?: string): OrderProgressBarState {
  const fullState = useAtomValue(ordersProgressBarStateAtom)
  const singleState = orderId ? fullState[orderId] : undefined

  return useMemo(() => singleState || DEFAULT_STATE, [singleState])
}

function getStepNameUpdateTimer(
  updateStepName: (stepName: OrderProgressBarStepName) => void,
  stepName: OrderProgressBarStepName,
  currentStepName: OrderProgressBarState['progressBarStepName'],
  hasShownExecutingInCurrentAttempt: OrderProgressBarState['hasShownExecutingInCurrentAttempt'],
  lastTimeChangedSteps: OrderProgressBarState['lastTimeChangedSteps'],
  isConfirmed: boolean,
  backendApiStatus: OrderProgressBarState['backendApiStatus'],
  bridgingStatus: SwapAndBridgeStatus | undefined,
  isBridgingTrade: boolean,
): NodeJS.Timeout | undefined {
  const timeSinceLastChange = lastTimeChangedSteps ? Date.now() - lastTimeChangedSteps : 0
  const completionDelayMs = getCompletionDelayMs(currentStepName, stepName, lastTimeChangedSteps)
  const shouldApplyStepNow = shouldApplyStepNameNow(
    lastTimeChangedSteps,
    timeSinceLastChange,
    stepName,
    currentStepName,
    hasShownExecutingInCurrentAttempt,
    isConfirmed,
    backendApiStatus,
    bridgingStatus,
    isBridgingTrade,
  )

  if (completionDelayMs > 0) {
    return setTimeout(() => updateStepName(stepName), completionDelayMs)
  }

  if (shouldApplyStepNow) {
    updateStepName(stepName)

    if (stepName === OrderProgressBarStepName.SUBMISSION_FAILED) {
      return setTimeout(() => updateStepName(OrderProgressBarStepName.SOLVING), MINIMUM_STEP_DISPLAY_TIME)
    }

    return undefined
  }

  return setTimeout(() => updateStepName(stepName), MINIMUM_STEP_DISPLAY_TIME - timeSinceLastChange)
}

function useProgressBarStepNameUpdater(
  orderId: string | undefined,
  isUnfillable: boolean,
  isCancelled: boolean,
  isExpired: boolean,
  isCancelling: boolean,
  cancellationTriggered: undefined | true,
  isConfirmed: boolean,
  countdown: OrderProgressBarState['countdown'],
  currentStepName: OrderProgressBarState['progressBarStepName'],
  backendApiStatus: OrderProgressBarState['backendApiStatus'],
  previousBackendApiStatus: OrderProgressBarState['previousBackendApiStatus'],
  lastTimeChangedSteps: OrderProgressBarState['lastTimeChangedSteps'],
  previousStepName: OrderProgressBarState['previousStepName'],
  hasShownExecutingInCurrentAttempt: OrderProgressBarState['hasShownExecutingInCurrentAttempt'],
  bridgingStatus: SwapAndBridgeStatus | undefined,
  isBridgingTrade: boolean,
): void {
  const updateStepName = useUpdateProgressBarStepName(orderId)
  const stepName = getProgressBarStepName(
    isUnfillable,
    isCancelled,
    isExpired,
    isCancelling,
    cancellationTriggered,
    isConfirmed,
    countdown,
    currentStepName,
    backendApiStatus,
    previousBackendApiStatus,
    previousStepName,
    hasShownExecutingInCurrentAttempt,
    bridgingStatus,
    isBridgingTrade,
  )

  useEffect(() => {
    if (!orderId) {
      return
    }
    const timer = getStepNameUpdateTimer(
      updateStepName,
      stepName,
      currentStepName,
      hasShownExecutingInCurrentAttempt,
      lastTimeChangedSteps,
      isConfirmed,
      backendApiStatus,
      bridgingStatus,
      isBridgingTrade,
    )

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [
    backendApiStatus,
    bridgingStatus,
    currentStepName,
    isBridgingTrade,
    isConfirmed,
    lastTimeChangedSteps,
    orderId,
    previousStepName,
    hasShownExecutingInCurrentAttempt,
    stepName,
    updateStepName,
  ])
}

function shouldApplyStepNameNow(
  lastTimeChangedSteps: OrderProgressBarState['lastTimeChangedSteps'],
  timeSinceLastChange: number,
  stepName: OrderProgressBarStepName,
  currentStepName: OrderProgressBarState['progressBarStepName'],
  hasShownExecutingInCurrentAttempt: OrderProgressBarState['hasShownExecutingInCurrentAttempt'],
  isConfirmed: boolean,
  backendApiStatus: OrderProgressBarState['backendApiStatus'],
  bridgingStatus: SwapAndBridgeStatus | undefined,
  isBridgingTrade: boolean,
): boolean {
  return (
    shouldApplyCompletionDrivenExecutingImmediately(
      stepName,
      currentStepName,
      hasShownExecutingInCurrentAttempt,
      isConfirmed,
      backendApiStatus,
      bridgingStatus,
      isBridgingTrade,
    ) || shouldApplyStepNameImmediately(lastTimeChangedSteps, timeSinceLastChange, stepName)
  )
}

export function shouldApplyStepNameImmediately(
  lastTimeChangedSteps: OrderProgressBarState['lastTimeChangedSteps'],
  timeSinceLastChange: number,
  stepName: OrderProgressBarStepName,
): boolean {
  return (
    lastTimeChangedSteps === undefined ||
    timeSinceLastChange >= MINIMUM_STEP_DISPLAY_TIME ||
    stepName === OrderProgressBarStepName.CANCELLING ||
    stepName === OrderProgressBarStepName.SUBMISSION_FAILED ||
    stepName === OrderProgressBarStepName.BRIDGING_FINISHED ||
    stepName === OrderProgressBarStepName.FINISHED ||
    stepName === OrderProgressBarStepName.CANCELLATION_FAILED ||
    stepName === OrderProgressBarStepName.CANCELLED ||
    stepName === OrderProgressBarStepName.EXPIRED
  )
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

function useUpdateProgressBarStepName(orderId: string | undefined): (name: OrderProgressBarStepName) => void {
  const setProgressBarStepName = useSetExecutingOrderProgressBarStepNameCallback()

  return useCallback(
    (name: OrderProgressBarStepName) => {
      if (!orderId) {
        return
      }

      setProgressBarStepName(orderId, name || DEFAULT_STEP_NAME)
    },
    [orderId, setProgressBarStepName],
  )
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

function useBackendApiStatusUpdater(chainId: SupportedChainId, orderId: string | undefined, doNotQuery: boolean): void {
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
