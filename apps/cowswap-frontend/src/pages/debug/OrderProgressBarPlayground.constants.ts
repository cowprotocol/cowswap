import { SwapAndBridgeStatus } from 'modules/bridge'
import { OrderProgressBarStepName } from 'modules/orderProgressBar'

import {
  getDemoBridgeContext,
  PLAYGROUND_ACTIVE_COUNTDOWN,
  type ScenarioFrame,
} from './OrderProgressBarPlayground.demo.constants'

const DEFAULT_FRAME_HOLD_MS = 1200
const SEARCHING_FRAME_HOLD_MS = 1500
const RETRY_FRAME_HOLD_MS = 1800

export type Scenario = { id: string; label: string; frames: [ScenarioFrame, ...ScenarioFrame[]] }
export type StaticPreview = { id: string; label: string; frame: ScenarioFrame }

function getScenarioFrame(
  stepName: OrderProgressBarStepName,
  backendStatus: string,
  holdMs: number,
  extra: Partial<Omit<ScenarioFrame, 'backendStatus' | 'holdMs' | 'stepName'>> = {},
): ScenarioFrame {
  return { backendStatus, holdMs, stepName, ...extra }
}

function getStaticPreview(id: string, label: string, frame: ScenarioFrame): StaticPreview {
  return { id, label, frame }
}

const getInitialFrame = (backendStatus = 'scheduled'): ScenarioFrame =>
  getScenarioFrame(OrderProgressBarStepName.INITIAL, backendStatus, DEFAULT_FRAME_HOLD_MS)

function getSearchingFrame(
  backendStatus = 'active',
  holdMs = SEARCHING_FRAME_HOLD_MS,
  extra: Partial<Omit<ScenarioFrame, 'backendStatus' | 'holdMs' | 'stepName'>> = {},
): ScenarioFrame {
  return getScenarioFrame(OrderProgressBarStepName.SOLVING, backendStatus, holdMs, {
    countdown: PLAYGROUND_ACTIVE_COUNTDOWN,
    ...extra,
  })
}

const getDelayedFrame = (backendStatus = 'open', holdMs = SEARCHING_FRAME_HOLD_MS): ScenarioFrame =>
  getScenarioFrame(OrderProgressBarStepName.DELAYED, backendStatus, holdMs)

const getExecutingFrame = (backendStatus = 'executing', holdMs = DEFAULT_FRAME_HOLD_MS): ScenarioFrame =>
  getScenarioFrame(OrderProgressBarStepName.EXECUTING, backendStatus, holdMs)

const getFinishedFrame = (backendStatus = 'traded'): ScenarioFrame =>
  getScenarioFrame(OrderProgressBarStepName.FINISHED, backendStatus, 0)

const getBridgeFrame = (
  stepName: OrderProgressBarStepName,
  backendStatus: string,
  holdMs: number,
  swapAndBridgeContext: NonNullable<ScenarioFrame['swapAndBridgeContext']>,
): ScenarioFrame => getScenarioFrame(stepName, backendStatus, holdMs, { isBridgingTrade: true, swapAndBridgeContext })

const BRIDGE_PENDING_CONTEXT = getDemoBridgeContext(SwapAndBridgeStatus.PENDING)
const BRIDGE_DONE_CONTEXT = getDemoBridgeContext(SwapAndBridgeStatus.DONE)

export const PLAYGROUND_SCENARIOS: Scenario[] = [
  {
    id: 'happyPath',
    label: 'Happy path: scheduled -> active -> executing -> traded',
    frames: [getInitialFrame(), getSearchingFrame(), getExecutingFrame(), getFinishedFrame()],
  },
  {
    id: 'skipExecutingPoll',
    label: 'Missed executing poll: scheduled -> active -> open -> traded',
    frames: [
      getInitialFrame(),
      getSearchingFrame(),
      getDelayedFrame(),
      getExecutingFrame('traded'),
      getFinishedFrame(),
    ],
  },
  {
    id: 'submissionRetry',
    label: 'Submission retry: scheduled -> active -> executing -> open -> traded',
    frames: [
      getInitialFrame(),
      getSearchingFrame(),
      getExecutingFrame(),
      getScenarioFrame(OrderProgressBarStepName.SUBMISSION_FAILED, 'open', RETRY_FRAME_HOLD_MS),
      getScenarioFrame(OrderProgressBarStepName.SOLVING, 'open', SEARCHING_FRAME_HOLD_MS),
      getExecutingFrame('traded'),
      getFinishedFrame(),
    ],
  },
  {
    id: 'submissionRetryWithNotFound',
    label: 'Retry with NotFound: active -> executing -> open -> notFound -> traded',
    frames: [
      getInitialFrame(),
      getSearchingFrame(),
      getExecutingFrame(),
      getScenarioFrame(OrderProgressBarStepName.SUBMISSION_FAILED, 'open', RETRY_FRAME_HOLD_MS),
      getScenarioFrame(OrderProgressBarStepName.SOLVING, 'notFound', DEFAULT_FRAME_HOLD_MS),
      getExecutingFrame('traded'),
      getFinishedFrame(),
    ],
  },
  {
    id: 'issue6642StartsUnfillable',
    label: 'Issue #6642 fixed: approval lag stays on batching/searching',
    frames: [
      getInitialFrame('scheduled + approval lag'),
      getSearchingFrame(),
      getDelayedFrame('open + allowance lag'),
      getExecutingFrame('traded'),
      getFinishedFrame(),
    ],
  },
  {
    id: 'issue6881UnfillableToCancelling',
    label: 'Issue #6881: price change -> cancelling',
    frames: [
      getSearchingFrame(),
      getScenarioFrame(OrderProgressBarStepName.UNFILLABLE, 'open + price out of market', DEFAULT_FRAME_HOLD_MS),
      getScenarioFrame(OrderProgressBarStepName.CANCELLING, 'local cancelling', SEARCHING_FRAME_HOLD_MS),
      getScenarioFrame(OrderProgressBarStepName.CANCELLED, 'cancelled', 0),
    ],
  },
  {
    id: 'fastFillFromInitial',
    label: 'Fast fill from initial: scheduled -> traded',
    frames: [getInitialFrame(), getFinishedFrame()],
  },
  {
    id: 'reloadMissedFulfilledEvent',
    label: 'Reload path: scheduled -> active -> traded',
    frames: [getInitialFrame(), getSearchingFrame(), getExecutingFrame('traded'), getFinishedFrame()],
  },
  {
    id: 'bridgeContextReload',
    label: 'Bridge context reload after fill',
    frames: [
      getInitialFrame(),
      getSearchingFrame(),
      getExecutingFrame('traded'),
      getBridgeFrame(
        OrderProgressBarStepName.BRIDGING_IN_PROGRESS,
        'traded + bridge pending',
        SEARCHING_FRAME_HOLD_MS,
        BRIDGE_PENDING_CONTEXT,
      ),
      getBridgeFrame(
        OrderProgressBarStepName.BRIDGING_IN_PROGRESS,
        'traded + bridge context missing',
        SEARCHING_FRAME_HOLD_MS,
        BRIDGE_PENDING_CONTEXT,
      ),
      getBridgeFrame(OrderProgressBarStepName.BRIDGING_FINISHED, 'traded + bridge done', 0, BRIDGE_DONE_CONTEXT),
    ],
  },
  {
    id: 'cancellationRace',
    label: 'Cancellation race: cancelling -> traded',
    frames: [
      getSearchingFrame(),
      getScenarioFrame(OrderProgressBarStepName.CANCELLING, 'local cancelling', SEARCHING_FRAME_HOLD_MS),
      getScenarioFrame(OrderProgressBarStepName.CANCELLATION_FAILED, 'traded', 0),
    ],
  },
]

export const STATIC_PLAYGROUND_PREVIEWS: StaticPreview[] = [
  getStaticPreview('initial', 'Static: step 1 batching orders', getInitialFrame()),
  getStaticPreview('solving', 'Static: step 2 competition started', getSearchingFrame('active', 0)),
  getStaticPreview('delayed', 'Static: step 2 still searching', getDelayedFrame('open', 0)),
  getStaticPreview('executing', 'Static: step 3 executing', getExecutingFrame('executing', 0)),
  getStaticPreview(
    'submissionFailed',
    'Static: step 2 submission failed',
    getScenarioFrame(OrderProgressBarStepName.SUBMISSION_FAILED, 'open', 0),
  ),
  getStaticPreview(
    'unfillable',
    'Static: price change',
    getScenarioFrame(OrderProgressBarStepName.UNFILLABLE, 'local price-derived unfillable', 0),
  ),
  getStaticPreview(
    'cancelling',
    'Static: cancelling',
    getScenarioFrame(OrderProgressBarStepName.CANCELLING, 'local cancelling', 0),
  ),
  getStaticPreview(
    'cancelled',
    'Static: cancelled',
    getScenarioFrame(OrderProgressBarStepName.CANCELLED, 'cancelled', 0),
  ),
  getStaticPreview('expired', 'Static: expired', getScenarioFrame(OrderProgressBarStepName.EXPIRED, 'expired', 0)),
  getStaticPreview(
    'cancellationFailed',
    'Static: cancellation failed',
    getScenarioFrame(OrderProgressBarStepName.CANCELLATION_FAILED, 'traded', 0),
  ),
  getStaticPreview('finished', 'Static: transaction completed', getFinishedFrame()),
  getStaticPreview(
    'bridgingInProgress',
    'Static: bridging in progress',
    getBridgeFrame(OrderProgressBarStepName.BRIDGING_IN_PROGRESS, 'traded + bridge pending', 0, BRIDGE_PENDING_CONTEXT),
  ),
  getStaticPreview(
    'bridgingFailed',
    'Static: bridging failed',
    getBridgeFrame(
      OrderProgressBarStepName.BRIDGING_FAILED,
      'traded + bridge failed',
      0,
      getDemoBridgeContext(SwapAndBridgeStatus.FAILED),
    ),
  ),
  getStaticPreview(
    'refundCompleted',
    'Static: refund completed',
    getBridgeFrame(
      OrderProgressBarStepName.REFUND_COMPLETED,
      'traded + refund complete',
      0,
      getDemoBridgeContext(SwapAndBridgeStatus.REFUND_COMPLETE),
    ),
  ),
  getStaticPreview(
    'bridgingFinished',
    'Static: bridging finished',
    getBridgeFrame(OrderProgressBarStepName.BRIDGING_FINISHED, 'traded + bridge done', 0, BRIDGE_DONE_CONTEXT),
  ),
]
