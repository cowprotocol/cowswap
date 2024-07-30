import React, { useState } from 'react'
import { PiDotsThreeCircle, PiCheckCircleFill, PiSpinnerBallFill } from 'react-icons/pi'
import * as styledEl from './styled'

import progressBarStep1 from '@cowprotocol/assets/cow-swap/progress-bar-step1.png'
import progressBarStep1a from '@cowprotocol/assets/cow-swap/progress-bar-step1a.png'
import progressBarStep2a from '@cowprotocol/assets/cow-swap/progress-bar-step2a.png'
import progressBarStep2b from '@cowprotocol/assets/cow-swap/progress-bar-step2b.png'
import progressBarStep3 from '@cowprotocol/assets/cow-swap/progress-bar-step3.png'
import { isSellOrder } from '@cowprotocol/common-utils'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { AMM_LOGOS } from 'legacy/components/AMMsLogo'
import { Order } from 'legacy/state/orders/actions'

import { SolverCompetition } from 'api/cowProtocol/api'
import { OrderProgressBarStepName } from 'common/hooks/orderProgressBarV2'

export type OrderProgressBarV2Props = {
  stepName: OrderProgressBarStepName
  countdown?: number | null | undefined
  solverCompetition?: SolverCompetition
  order?: Order
  debugMode?: boolean
}

const steps = [
  {
    title: 'Placing order',
    description: 'Your order has been submitted and will be included in the next solver auction',
  },
  {
    title: 'Solving',
    description: 'The auction has started! Solvers are competing to find the best solution for you...',
  },
  { title: 'Executing', description: 'The winning solver will execute your order.' },
]

const StepComponent: React.FC<{
  status: string
  isFirst: boolean
  step: { title: string; description?: string }
  index: number
  extraContent?: React.ReactNode
}> = ({ status, isFirst, step, index, extraContent }) => (
  <styledEl.Step status={status} isFirst={isFirst}>
    <styledEl.Icon status={status}>
      <StatusIcon status={status} />
    </styledEl.Icon>
    <styledEl.Content>
      <styledEl.Title>
        {step.title}
        {status === 'active' && <styledEl.LoadingEllipsis />}
      </styledEl.Title>
      {step.description && <styledEl.Description>{step.description}</styledEl.Description>}
      {extraContent}
      {status === 'active' && <styledEl.LearnMore href="#">Learn more ↗</styledEl.LearnMore>}
    </styledEl.Content>
  </styledEl.Step>
)

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'done') return <PiCheckCircleFill />
  if (status === 'active') return <PiSpinnerBallFill className="spinner" />
  return <PiDotsThreeCircle />
}

export function OrderProgressBarV2(props: OrderProgressBarV2Props) {
  const { stepName, debugMode = true } = props
  const [debugStep, setDebugStep] = useState<OrderProgressBarStepName>(stepName)

  const currentStep = debugMode ? debugStep : stepName

  return (
    <>
      {STEP_NAME_TO_STEP_COMPONENT[currentStep](props)}
      {debugMode && (
        <styledEl.DebugPanel>
          <select value={debugStep} onChange={(e) => setDebugStep(e.target.value as OrderProgressBarStepName)}>
            {Object.keys(STEP_NAME_TO_STEP_COMPONENT).map((step) => (
              <option key={step} value={step}>
                {step}
              </option>
            ))}
          </select>
        </styledEl.DebugPanel>
      )}
    </>
  )
}

type StepCallback = (props: OrderProgressBarV2Props) => React.ReactNode
const STEP_NAME_TO_STEP_COMPONENT: Record<OrderProgressBarStepName, StepCallback> = {
  initial: InitialStep,
  solving: SolvingStep,
  solved: SolvedStep,
  executing: ExecutingStep,
  finished: FinishedStep,
  nextBatch: NextBatchStep,
  delayed: DelayedStep,
  unfillable: UnfillableStep,
  submissionFailed: SubmissionFailedStep,
  cancelling: CancellingStep,
  cancelled: CancelledStep,
  expired: ExpiredStep,
  cancellationFailed: CancellationFailedStep,
}

function InitialStep() {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper>
          <img src={progressBarStep1} alt="" />
        </styledEl.ProgressImageWrapper>
        <styledEl.OriginalOrderIntent>
          <styledEl.OrderTokenImage /> 1.43 WETH for at least <styledEl.OrderTokenImage /> 4832.43 USDC
        </styledEl.OriginalOrderIntent>
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
        {steps.map((step, index) => (
          <StepComponent
            key={index}
            status={index === 0 ? 'active' : index === 1 ? 'next' : 'future'}
            isFirst={index === 0}
            step={step}
            index={index}
          />
        ))}
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function SolvingStep({ countdown }: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <styledEl.StepsWrapper>
        {steps.map((step, index) => (
          <StepComponent
            key={index}
            status={index === 0 ? 'done' : index === 1 ? 'active' : 'next'}
            isFirst={false}
            step={step}
            index={index}
            extraContent={
              index === 1 ? <strong style={{ alignSelf: 'center', fontSize: '2em' }}>{countdown}</strong> : null
            }
          />
        ))}
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function SolvedStep({ solverCompetition }: OrderProgressBarV2Props) {
  const winningSolver = solverCompetition?.[0]

  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressImageWrapper>
        <img src={progressBarStep3} alt="" />
      </styledEl.ProgressImageWrapper>
      <styledEl.StepsWrapper>
        {steps.map((step, index) => (
          <StepComponent
            key={index}
            status={index === 2 ? 'active' : 'done'}
            isFirst={false}
            step={step}
            index={index}
            extraContent={
              index === 1 ? (
                <styledEl.Description>
                  <strong>
                    {solverCompetition?.length} solver{solverCompetition && solverCompetition?.length > 1 && 's'} joined
                    the competition!
                  </strong>
                </styledEl.Description>
              ) : index === 2 ? (
                <styledEl.Description>
                  Solver {winningSolver?.solver} proposed the best solution. It'll be executed on-chain shortly
                </styledEl.Description>
              ) : null
            }
          />
        ))}
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function ExecutingStep({ solverCompetition }: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressImageWrapper>
        <img src={progressBarStep3} alt="" />
      </styledEl.ProgressImageWrapper>
      <styledEl.StepsWrapper>
        {steps.map((step, index) => (
          <StepComponent
            key={index}
            status={index === 2 ? 'active' : 'done'}
            isFirst={false}
            step={step}
            index={index}
            extraContent={
              index === 1 ? (
                <styledEl.Description>
                  <strong>
                    {solverCompetition?.length} solver{solverCompetition && solverCompetition?.length > 1 && 's'} joined
                    the competition!
                  </strong>
                </styledEl.Description>
              ) : null
            }
          />
        ))}
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function FinishedStep({ solverCompetition, order }: OrderProgressBarV2Props) {
  const isSell = order && isSellOrder(order.kind)
  const displayToken = isSell ? order?.outputToken : order?.inputToken
  const solution = solverCompetition && solverCompetition[0]
  const displayAmount =
    displayToken &&
    solution &&
    CurrencyAmount.fromRawAmount(displayToken, isSell ? solution?.buyAmount : solution?.sellAmount)

  return (
    <styledEl.ProgressContainer>
      <styledEl.StepsWrapper>
        {steps.map((step, index) => (
          <StepComponent
            key={index}
            status="done"
            isFirst={false}
            step={step}
            index={index}
            extraContent={
              index === 2 ? (
                <styledEl.Description>
                  You {isSell ? 'received' : 'sold'} <TokenAmount amount={displayAmount} tokenSymbol={displayToken} />!
                </styledEl.Description>
              ) : null
            }
          />
        ))}
      </styledEl.StepsWrapper>
      {solverCompetition && (
        <div>
          <p>Solver ranking</p>
          <ol>
            {solverCompetition.map((entry) => {
              const imageProps = AMM_LOGOS[entry.solver] || AMM_LOGOS.default
              return (
                <li key={entry.solver}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      style={{ height: '20px', width: '20px', marginRight: '5px' }}
                      {...imageProps}
                      alt="Solver logo"
                    />
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
        </div>
      )}
    </styledEl.ProgressContainer>
  )
}

function NextBatchStep({ solverCompetition }: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <styledEl.StepsWrapper>
        {steps.map((step, index) => (
          <StepComponent
            key={index}
            status={index === 0 ? 'done' : index === 1 ? 'active' : 'next'}
            isFirst={false}
            step={step}
            index={index}
            extraContent={
              index === 1 ? (
                <styledEl.Description>
                  Your order wasn't a part of the winning solution for this auction. It will be included in the next
                  auction.
                </styledEl.Description>
              ) : null
            }
          />
        ))}
      </styledEl.StepsWrapper>
      {solverCompetition && (
        <div>
          <p>Solver ranking</p>
          <ol>
            {solverCompetition.map((entry) => {
              const imageProps = AMM_LOGOS[entry.solver] || AMM_LOGOS.default
              return (
                <li key={entry.solver}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      style={{ height: '20px', width: '20px', marginRight: '5px' }}
                      {...imageProps}
                      alt="Solver logo"
                    />
                    <span>
                      {entry.solver}
                      {entry.sellAmount && ' <- your order was included in this solution'}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </styledEl.ProgressContainer>
  )
}

function DelayedStep() {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressImageWrapper>
        <img src={progressBarStep2a} alt="" />
      </styledEl.ProgressImageWrapper>
      <styledEl.StepsWrapper>
        {steps.map((step, index) => (
          <StepComponent
            key={index}
            status={index === 0 ? 'done' : index === 1 ? 'active' : 'next'}
            isFirst={false}
            step={step}
            index={index}
            extraContent={
              index === 1 ? (
                <styledEl.Description>
                  This is taking longer than expected! Solvers are still searching...
                </styledEl.Description>
              ) : null
            }
          />
        ))}
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function UnfillableStep() {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressImageWrapper>
        <img src={progressBarStep1a} alt="" />
      </styledEl.ProgressImageWrapper>
      <styledEl.StepsWrapper>
        {steps.map((step, index) => (
          <StepComponent
            key={index}
            status={index === 0 ? 'done' : index === 1 ? 'error' : 'future'}
            isFirst={false}
            step={step}
            index={index}
            extraContent={
              index === 1 ? (
                <styledEl.Description>
                  Your order's price is currently out of market. You can wait or cancel the order.
                </styledEl.Description>
              ) : null
            }
          />
        ))}
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function SubmissionFailedStep() {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressImageWrapper>
        <img src={progressBarStep2b} alt="" />
      </styledEl.ProgressImageWrapper>
      <styledEl.StepsWrapper>
        {steps.map((step, index) => (
          <StepComponent
            key={index}
            status={index === 2 ? 'error' : index === 1 ? 'active' : 'done'}
            isFirst={false}
            step={step}
            index={index}
            extraContent={
              index === 2 ? (
                <styledEl.Description>
                  The order could not be settled on-chain. Solvers are competing to find a new solution...
                </styledEl.Description>
              ) : null
            }
          />
        ))}
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function CancellingStep() {
  return <div>Your order is being cancelled</div>
}

function CancelledStep() {
  return <div>Your order has been cancelled</div>
}

function ExpiredStep() {
  return <div>Your order has expired</div>
}

function CancellationFailedStep() {
  return <div>Failed to cancel, order executed instead. Oops!</div>
}

export default OrderProgressBarV2
