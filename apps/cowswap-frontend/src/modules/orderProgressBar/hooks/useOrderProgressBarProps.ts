import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'

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

import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { getOrderCompetitionStatus } from 'api/cowProtocol/api'
import { useCancelOrder } from 'common/hooks/useCancelOrder'
import { useGetSurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { useSolversInfo } from 'common/hooks/useSolversInfo'
import { featureFlagsAtom } from 'common/state/featureFlagsState'
import { ActivityDerivedState } from 'common/types/activity'
import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'

import { BridgeQuoteAmounts, type SwapAndBridgeContext, SwapAndBridgeStatus } from '../../bridge'
import { useSwapAndBridgeContext } from '../../bridge/hooks/useSwapAndBridgeContext'
import { OrderProgressBarStepName, DEFAULT_STEP_NAME } from '../constants'
import {
  ordersProgressBarStateAtom,
  setOrderProgressBarCancellationTriggered,
  updateOrderProgressBarBackendInfo,
  updateOrderProgressBarCountdown,
  updateOrderProgressBarStepName,
} from '../state/atoms'
import { ApiSolverCompetition, OrderProgressBarProps, OrderProgressBarState, SolverCompetition } from '../types'

type UseOrderProgressBarPropsParams = {
  activityDerivedState: ActivityDerivedState | null
  chainId: SupportedChainId
  isBridgingTrade: boolean
  bridgeQuoteAmounts?: BridgeQuoteAmounts
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
  bridgeQuoteAmounts?: BridgeQuoteAmounts,
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
    bridgeQuoteAmounts,
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
  const { activityDerivedState, chainId, isBridgingTrade, bridgeQuoteAmounts } = params

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

  const doNotQuery = getDoNotQueryStatusEndpoint(order, apiSolverCompetition, !!disableProgressBar)

  const winnerSolver = apiSolverCompetition?.[0]
  const swapAndBridgeContext = useSwapAndBridgeContext(
    chainId,
    isBridgingTrade ? order : undefined,
    winnerSolver,
    bridgeQuoteAmounts,
  )
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
  useCountdownStartUpdater(orderId, countdown, backendApiStatus)

  const solverCompetition = useMemo(
    () =>
      apiSolverCompetition
        ?.map((entry) => mergeSolverData(entry, solversInfo))
        // Reverse it since backend returns the solutions ranked ascending. Winner is the last one.
        .reverse(),
    [apiSolverCompetition, solversInfo],
  )

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
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getDoNotQueryStatusEndpoint(
  order: Order | undefined,
  apiSolverCompetition: CompetitionOrderStatus['value'] | undefined,
  disableProgressBar: boolean,
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

const DEFAULT_STATE = {}

function useGetExecutingOrderState(orderId: string): OrderProgressBarState {
  const fullState = useAtomValue(ordersProgressBarStateAtom)
  const singleState = fullState[orderId]

  return useMemo(() => singleState || DEFAULT_STATE, [singleState])
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function useSetExecutingOrderCountdownCallback() {
  const setAtom = useSetAtom(updateOrderProgressBarCountdown)

  return useCallback((orderId: string, value: number | null) => setAtom({ orderId, value }), [setAtom])
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function useSetExecutingOrderProgressBarStepNameCallback() {
  const setValue = useSetAtom(updateOrderProgressBarStepName)

  return useCallback(
    (orderId: string, value: OrderProgressBarStepName) => {
      setValue({ orderId, value })
    },
    [setValue],
  )
}

// local updaters

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function useCountdownStartUpdater(
  orderId: string,
  countdown: OrderProgressBarState['countdown'],
  backendApiStatus: OrderProgressBarState['backendApiStatus'],
) {
  const setCountdown = useSetExecutingOrderCountdownCallback()

  useEffect(() => {
    // Start countdown immediately when backend becomes active to reflect real protocol timing
    // The solver competition genuinely starts when backend is active, regardless of UI delays
    if (countdown == null && backendApiStatus === 'active') {
      setCountdown(orderId, PROGRESS_BAR_TIMER_DURATION)
    } else if (backendApiStatus !== 'active' && countdown) {
      // Every time backend status is not `active` and countdown is set, reset the countdown
      setCountdown(orderId, null)
    }
  }, [backendApiStatus, setCountdown, countdown, orderId])
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function useCancellingOrderUpdater(orderId: string, isCancelling: boolean) {
  const setCancellationTriggered = useSetAtom(setOrderProgressBarCancellationTriggered)

  useEffect(() => {
    if (isCancelling) setCancellationTriggered(orderId)
  }, [orderId, isCancelling, setCancellationTriggered])
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
  previousStepName: OrderProgressBarState['previousStepName'],
  bridgingStatus: SwapAndBridgeStatus | undefined,
  isBridgingTrade: boolean,
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
    previousStepName,
    bridgingStatus,
    isBridgingTrade,
  )

  // Update state with new step name
  useEffect(() => {
    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    function updateStepName(name: OrderProgressBarStepName) {
      setProgressBarStepName(orderId, name || DEFAULT_STEP_NAME)
    }

    let timer: NodeJS.Timeout

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
      clearInterval(timer)
    }
  }, [orderId, stepName, lastTimeChangedSteps, setProgressBarStepName])
}

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
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
  previousStepName: OrderProgressBarState['previousStepName'],
  bridgingStatus: SwapAndBridgeStatus | undefined,
  isBridgingTrade: boolean,
): OrderProgressBarStepName {
  const isTradedOrConfirmed = backendApiStatus === 'traded' || isConfirmed

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
    previousBackendApiStatus === 'executing' &&
    (backendApiStatus === 'active' || backendApiStatus === 'open' || backendApiStatus === 'scheduled')
  ) {
    // moved back from executing to active
    return OrderProgressBarStepName.SUBMISSION_FAILED
  } else if (isUnfillable) {
    // out of market order
    return OrderProgressBarStepName.UNFILLABLE
  } else if (backendApiStatus === 'active' && countdown === 0) {
    // solving, but took longer than stipulated countdown
    return OrderProgressBarStepName.DELAYED
  } else if (
    (backendApiStatus === 'open' || backendApiStatus === 'scheduled') &&
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
  scheduled: OrderProgressBarStepName.INITIAL,
  open: OrderProgressBarStepName.INITIAL,
  active: OrderProgressBarStepName.SOLVING,
  solved: OrderProgressBarStepName.SOLVED,
  executing: OrderProgressBarStepName.EXECUTING,
  traded: OrderProgressBarStepName.FINISHED,
  cancelled: OrderProgressBarStepName.INITIAL, // TODO: maybe add another state for finished with error?
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function usePendingOrderStatus(chainId: SupportedChainId, orderId: string, doNotQuery?: boolean) {
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
  const solverInfo = solversInfo[solverId]

  return { ...solverCompetition, ...solverInfo, solverId, solver: solverId }
}
