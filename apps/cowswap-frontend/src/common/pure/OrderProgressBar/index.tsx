import progressBarStep1 from '@cowprotocol/assets/cow-swap/progress-bar-step1.png'
import progressBarStep3 from '@cowprotocol/assets/cow-swap/progress-bar-step3.png'
import progressBarStep2a from '@cowprotocol/assets/cow-swap/progress-bar-step2a.png'
import progressBarStep1a from '@cowprotocol/assets/cow-swap/progress-bar-step1a.png'
import progressBarStep2b from '@cowprotocol/assets/cow-swap/progress-bar-step2b.png'

import { isSellOrder } from '@cowprotocol/common-utils'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { OrderStatus } from 'api/cowProtocol/api'
import { AMM_LOGOS } from 'legacy/components/AMMsLogo'
import { Order } from 'legacy/state/orders/actions'
import { Stepper, StepProps } from '../Stepper'

type happyPath = 'initial' | 'solving' | 'executing' | 'finished'
type errorFlow = 'nextBatch' | 'delayed' | 'unfillable' | 'submissionFailed'
type OrderProgressBarStepNames = happyPath | errorFlow

export type OrderProgressBarProps = {
  stepName: OrderProgressBarStepNames
  countdown?: number | null | undefined
  solverCompetition?: OrderStatus['value']
  order?: Order
}

const PROGRESS_BAR_STEPS: StepProps[] = [
  { stepState: 'open', stepNumber: 1, label: 'placing' },
  { stepState: 'open', stepNumber: 2, label: 'solving' },
  { stepState: 'open', stepNumber: 3, label: 'executing' },
  { stepState: 'open', stepNumber: 4, label: 'done' },
]

export function OrderProgressBar(props: OrderProgressBarProps) {
  const { stepName } = props

  return STEP_NAME_TO_STEP_COMPONENT[stepName](props)
}

type StepCallback = (props: OrderProgressBarProps) => JSX.Element
const STEP_NAME_TO_STEP_COMPONENT: Record<OrderProgressBarStepNames, StepCallback> = {
  initial: (props: OrderProgressBarProps): JSX.Element => {
    return <InitialStep />
  },
  solving: (props: OrderProgressBarProps): JSX.Element => {
    return <SolvingStep {...props} />
  },
  executing: (props: OrderProgressBarProps): JSX.Element => {
    return <ExecutingStep {...props} />
  },
  finished: (props: OrderProgressBarProps): JSX.Element => {
    return <FinishedStep {...props} />
  },
  nextBatch: (props: OrderProgressBarProps): JSX.Element => {
    // TODO: add a flow for `nextBatch`?
    return <SolvingStep {...props} />
  },
  delayed: (props: OrderProgressBarProps): JSX.Element => {
    return <DelayedStep />
  },
  unfillable: (props: OrderProgressBarProps): JSX.Element => {
    return <UnfillableStep {...props} />
  },
  submissionFailed: (props: OrderProgressBarProps): JSX.Element => {
    return <SubmissionFailedStep />
  },
}

function InitialStep() {
  const localSteps = structuredClone(PROGRESS_BAR_STEPS)
  localSteps[0].stepState = 'loading'

  return (
    <div>
      <ProgressImage src={progressBarStep1} alt="" />
      <p>Your order has been submitted and will be included in the next solver auction.</p>
      <Stepper steps={localSteps} />
    </div>
  )
}

function SolvingStep({ countdown }: OrderProgressBarProps) {
  const localSteps = structuredClone(PROGRESS_BAR_STEPS)
  localSteps[0].stepState = 'finished'
  localSteps[1].stepState = 'loading'

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <strong style={{ alignSelf: 'center', fontSize: '5em' }}>{countdown}</strong>
        <p>The auction has started! Solvers are competing to find the best solution for you...</p>
      </div>
      <Stepper steps={localSteps} />
    </>
  )
}

function ExecutingStep({ solverCompetition }: OrderProgressBarProps) {
  const localSteps = structuredClone(PROGRESS_BAR_STEPS)

  localSteps[0].stepState = 'finished'
  localSteps[1].stepState = 'finished'
  localSteps[2].stepState = 'loading'
  return (
    <div>
      <ProgressImage src={progressBarStep3} alt="" />
      <p>
        <strong>
          {solverCompetition?.length} solver{solverCompetition && solverCompetition?.length > 1 && 's'} joined the
          competition!
        </strong>
      </p>
      <p>The winner is submitting your order on-chain...</p>
      <Stepper steps={localSteps} />
    </div>
  )
}

function FinishedStep({ solverCompetition, order }: OrderProgressBarProps) {
  const localSteps = structuredClone(PROGRESS_BAR_STEPS)
  localSteps[0].stepState = 'finished'
  localSteps[1].stepState = 'finished'
  localSteps[2].stepState = 'finished'
  localSteps[3].stepState = 'finished'

  const isSell = order && isSellOrder(order.kind)
  const displayToken = isSell ? order?.outputToken : order?.inputToken
  const solution = solverCompetition && solverCompetition[0]
  const displayAmount =
    displayToken &&
    solution &&
    CurrencyAmount.fromRawAmount(displayToken, isSell ? solution?.buyAmount : solution?.sellAmount)
  return (
    <div>
      <span>
        You {isSell ? 'received' : 'sold'} <TokenAmount amount={displayAmount} tokenSymbol={displayToken} />!
      </span>

      <p>Solver ranking</p>
      <ol>
        {solverCompetition?.map((entry) => {
          const imageProps = AMM_LOGOS[entry.solver] || AMM_LOGOS.default

          return (
            <li key={entry.solver}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img style={{ height: '20px', width: '20px', marginRight: '5px' }} {...imageProps} alt="Solver logo" />
                <span>{entry.solver}</span>
              </div>
            </li>
          )
        })}
      </ol>
      {/*TODO: if we want to display the runner up, uncomment */}
      {/*{solverCompetition && solverCompetition.length > 1 && (*/}
      {/*  <p>*/}
      {/*    You would have gotten {solverCompetition[1].sellAmount} / {solverCompetition[1].sellAmount} on{' '}*/}
      {/*    {solverCompetition[1].solver}!*/}
      {/*  </p>*/}
      {/*)}*/}
      <Stepper steps={localSteps} />
    </div>
  )
}

function DelayedStep() {
  const localSteps = structuredClone(PROGRESS_BAR_STEPS)

  localSteps[0].stepState = 'finished'
  localSteps[1].stepState = 'loading'
  return (
    <div>
      <ProgressImage src={progressBarStep2a} alt="" />
      <p>This is taking longer than expected! Solvers are still searching...</p>
      <Stepper steps={localSteps} />
    </div>
  )
}

function UnfillableStep({}: OrderProgressBarProps) {
  // TODO: add link to cancel order
  const localSteps = structuredClone(PROGRESS_BAR_STEPS)

  localSteps[0].stepState = 'finished'
  localSteps[1].stepState = 'error'
  return (
    <div>
      <ProgressImage src={progressBarStep1a} alt="" />
      <p>Your order’s price is currently out of market. You can wait or cancel the order.</p>
      <Stepper steps={localSteps} />
    </div>
  )
}

function SubmissionFailedStep() {
  const localSteps = structuredClone(PROGRESS_BAR_STEPS)

  localSteps[0].stepState = 'finished'
  localSteps[1].stepState = 'loading'
  localSteps[2].stepState = 'error'
  return (
    <div>
      <ProgressImage src={progressBarStep2b} alt="" />
      <p>The order could not be settled on-chain. Solvers are competing to find a new solution...</p>
      <Stepper steps={localSteps} />
    </div>
  )
}

const ProgressImage = styled.img`
  width: 100%;
`
