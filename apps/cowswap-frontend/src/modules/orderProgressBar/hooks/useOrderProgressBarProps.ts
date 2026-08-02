import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { shortenAddress } from '@cowprotocol/common-utils'
import { SolverInfo } from '@cowprotocol/core'
import { CompetitionOrderStatus, getAddressKey, isSupportedAddress, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useENS } from '@cowprotocol/ens'
import { Command } from '@cowprotocol/types'

import { useInjectedWidgetParams } from 'entities/injectedWidget'
import ms from 'ms.macro'
import useSWR from 'swr'

import { useActivityDerivedState } from 'legacy/hooks/useActivityDerivedState'
import { useMultipleActivityDescriptors } from 'legacy/hooks/useRecentActivity'
import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { type SwapAndBridgeContext, SwapAndBridgeStatus } from 'modules/bridge'

import { getOrderCompetitionStatus } from 'api/cowProtocol/api'
import { useCancelOrder } from 'common/hooks/useCancelOrder'
import { useGetSurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { useSolversInfoByAddress } from 'common/hooks/useSolversInfo'
import { useSwapAndBridgeContext } from 'common/hooks/useSwapAndBridgeContext'
import { featureFlagsAtom } from 'common/state/featureFlagsState'
import { ActivityDerivedState } from 'common/types/activity'
import { ApiSolverCompetition, SolverCompetition } from 'common/types/soverCompetition'
import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'

import { DEFAULT_STEP_NAME, getProgressBarTimerDuration, OrderProgressBarStepName } from '../constants'
import {
  ordersProgressBarStateAtom,
  setOrderProgressBarCancellationTriggered,
  updateOrderProgressBarBackendInfo,
  updateOrderProgressBarCountdown,
  updateOrderProgressBarStepName,
} from '../state/atoms'
import { OrderProgressBarProps, OrderProgressBarState } from '../types'

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
  isBridgingTrade: boolean
}

const MINIMUM_STEP_DISPLAY_TIME = ms`5s`

// Steps that should be shown immediately, bypassing the minimum step-display debounce
const IMMEDIATE_STEP_NAMES: OrderProgressBarStepName[] = [
  OrderProgressBarStepName.FINISHED,
  OrderProgressBarStepName.CANCELLATION_FAILED,
  OrderProgressBarStepName.CANCELLING,
  OrderProgressBarStepName.CANCELLED,
  OrderProgressBarStepName.EXPIRED,
]

// A step is shown immediately when it's the first change, when the previous step has been
// displayed long enough, or when it's a terminal/cancellation step that must not be debounced.
export function shouldUpdateStepImmediately(
  stepName: OrderProgressBarStepName,
  lastTimeChangedSteps: number | undefined,
  timeSinceLastChange: number,
): boolean {
  return (
    lastTimeChangedSteps === undefined ||
    timeSinceLastChange >= MINIMUM_STEP_DISPLAY_TIME ||
    IMMEDIATE_STEP_NAMES.includes(stepName)
  )
}

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
  const receiverEnsName = useENS(order?.receiver as `0x${string}` | undefined)?.name || undefined

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

  const solversInfoByAddress = useSolversInfoByAddress(chainId)
  // Count distinct solvers, not deployments: a solver can run several addresses on the same chain
  const totalSolvers = new Set(Object.values(solversInfoByAddress).map(({ solverId }) => solverId)).size

  const doNotQuery = getDoNotQueryStatusEndpoint(order, apiSolverCompetition, !!disableProgressBar)

  const solverCompetition = useMemo(() => {
    const solversMap = apiSolverCompetition?.reduce(
      (acc, entry) => {
        // If the entry is not a valid or has no executedAmounts, the solution doesn't consider this order, skip it
        if (!entry || !entry.solver || !entry.executedAmounts) {
          return acc
        }
        // Merge the solver competition data with the info fetched from CMS under the same key, to avoid duplicates
        acc[entry.solver] = mergeSolverData(entry, solversInfoByAddress)
        return acc
      },
      {} as Record<string, SolverCompetition>,
    )

    return (
      Object.values(solversMap || {})
        // Reverse it since backend returns the solutions ranked ascending. Winner is the last one.
        .reverse()
    )
  }, [apiSolverCompetition, solversInfoByAddress])
  const { swapAndBridgeContext } = useSwapAndBridgeContext(
    chainId,
    isBridgingTrade ? order : undefined,
    solverCompetition?.[0],
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
  useCountdownStartUpdater(
    orderId,
    countdown,
    backendApiStatus,
    isUnfillable || isCancelled || isCancelling || isExpired,
    chainId,
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

const DEFAULT_STATE = {}

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
  chainId: SupportedChainId,
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
      setCountdown(orderId, getProgressBarTimerDuration(chainId))
    } else if (backendApiStatus !== CompetitionOrderStatus.type.ACTIVE && countdown != null) {
      // Every time backend status is not `active` and countdown is set, reset the countdown
      setCountdown(orderId, null)
    }
  }, [backendApiStatus, setCountdown, countdown, orderId, shouldDisableCountdown, chainId])
}

// local updaters

function useGetExecutingOrderState(orderId?: string): OrderProgressBarState {
  const fullState = useAtomValue(ordersProgressBarStateAtom)
  const singleState = orderId ? fullState[orderId] : undefined

  return useMemo(() => singleState || DEFAULT_STATE, [singleState])
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

    if (shouldUpdateStepImmediately(stepName, lastTimeChangedSteps, timeSinceLastChange)) {
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
      // Normalize solver addresses as the backend and the CMS might return them in different cases
      const solverCompetition = value?.map(({ solver, ...rest }) => ({
        ...rest,
        solver: getAddressKey(solver),
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
 * solver info fetched from CMS.
 *
 * The endpoint's `solver` field carries the on-chain solver address, which is what the CMS
 * branding is resolved by.
 *
 * @param solverCompetition
 * @param solversInfoByAddress
 */
function mergeSolverData(
  solverCompetition: ApiSolverCompetition,
  solversInfoByAddress: Record<string, SolverInfo>,
): SolverCompetition {
  const solverAddress = solverCompetition.solver
  const solverInfo = solversInfoByAddress[getAddressKey(solverAddress)]

  if (!solverInfo) {
    // Unknown to the CMS: display a shortened address so the full one doesn't break the UI layout.
    // `shortenAddress` throws on anything that isn't a known address format, hence the guard.
    const solver = isSupportedAddress(solverAddress) ? shortenAddress(solverAddress) : solverAddress

    return { ...solverCompetition, solverId: solverAddress, solver }
  }

  return { ...solverCompetition, ...solverInfo, solverId: solverInfo.solverId, solver: solverInfo.solverId }
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
