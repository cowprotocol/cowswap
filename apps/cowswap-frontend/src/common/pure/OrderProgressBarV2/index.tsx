import React, { useState } from 'react'

import progressBarStep1 from '@cowprotocol/assets/cow-swap/progress-bar-step1.png'
import progressBarStep1a from '@cowprotocol/assets/cow-swap/progress-bar-step1a.png'
// import progressBarStep2a from '@cowprotocol/assets/cow-swap/progress-bar-step2a.png'
import progressBarStep2b from '@cowprotocol/assets/cow-swap/progress-bar-step2b.png'
import progressBarStep3 from '@cowprotocol/assets/cow-swap/progress-bar-step3.png'
import { isSellOrder } from '@cowprotocol/common-utils'
// import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import {
  PiDotsThreeCircle,
  PiCheckCircleFill,
  PiSpinnerBallFill,
  PiClockCountdown,
  PiCaretDown,
  PiCaretUp,
} from 'react-icons/pi'

import { AMM_LOGOS } from 'legacy/components/AMMsLogo'
import { Order } from 'legacy/state/orders/actions'

import { SolverCompetition } from 'api/cowProtocol/api'
import { OrderProgressBarStepName } from 'common/hooks/orderProgressBarV2'

import * as styledEl from './styled'

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
  _index: number
  extraContent?: React.ReactNode
}> = ({ status, isFirst, step, extraContent }) => (
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

const OrderIntent: React.FC = () => (
  <styledEl.OriginalOrderIntent>
    <styledEl.OrderTokenImage /> 1.43 WETH for at least <styledEl.OrderTokenImage /> 4832.43 USDC
  </styledEl.OriginalOrderIntent>
)

export function OrderProgressBarV2(props: OrderProgressBarV2Props) {
  const { stepName, debugMode = true } = props
  const [debugStep, setDebugStep] = useState<OrderProgressBarStepName>(stepName)

  const currentStep = debugMode ? debugStep : stepName
  const StepComponent = STEP_NAME_TO_STEP_COMPONENT[currentStep]

  return (
    <>
      <StepComponent {...props} />
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

function InitialStep() {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper>
          <img src={progressBarStep1} alt="" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
        <div style={{ height: '60px' }}></div>
        <StepComponent status="active" isFirst={true} step={steps[0]} _index={0} />
        <StepComponent status="next" isFirst={false} step={steps[1]} _index={1} />
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function SolvingStep({ countdown }: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper>
          <img src={progressBarStep1} alt="" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
        <StepComponent status="done" isFirst={false} step={steps[0]} _index={0} />
        <StepComponent
          status="active"
          isFirst={false}
          step={steps[1]}
          _index={1}
          extraContent={<strong style={{ alignSelf: 'center', fontSize: '2em' }}>{countdown}</strong>}
        />
        <StepComponent status="next" isFirst={false} step={steps[2]} _index={2} />
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function SolvedStep({ solverCompetition }: OrderProgressBarV2Props) {
  const winningSolver = solverCompetition?.[0]

  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper>
          <img src={progressBarStep3} alt="" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
        <StepComponent status="done" isFirst={false} step={steps[0]} _index={0} />
        <StepComponent
          status="active"
          isFirst={false}
          step={steps[1]}
          _index={1}
          extraContent={
            <styledEl.Description>
              <strong>
                {solverCompetition?.length} solver{solverCompetition && solverCompetition?.length > 1 && 's'} joined the
                competition!
              </strong>
            </styledEl.Description>
          }
        />
        <StepComponent
          status="next"
          isFirst={false}
          step={steps[2]}
          _index={2}
          extraContent={
            <styledEl.Description>
              Solver {winningSolver?.solver} proposed the best solution. It'll be executed on-chain shortly
            </styledEl.Description>
          }
        />
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function ExecutingStep({ solverCompetition }: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper>
          <img src={progressBarStep3} alt="" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
        <StepComponent status="done" isFirst={false} step={steps[0]} _index={0} />
        <StepComponent
          status="active"
          isFirst={false}
          step={{ ...steps[1], title: 'Executing' }}
          _index={1}
          extraContent={
            <styledEl.Description>
              <strong>
                {solverCompetition?.length} solver{solverCompetition && solverCompetition?.length > 1 && 's'} joined the
                competition!
              </strong>
              <br />
              The winner will submit your order on-chain.
            </styledEl.Description>
          }
        />
        <StepComponent
          status="next"
          isFirst={false}
          step={{ title: 'Transaction completed', description: "You'll receive the settlement in your wallet." }}
          _index={2}
        />
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

const FinishedStep: React.FC<OrderProgressBarV2Props> = ({ solverCompetition, order }) => {
  const [showAllSolvers, setShowAllSolvers] = useState(false)
  const isSell = order && isSellOrder(order.kind)
  const displayToken = isSell ? order?.outputToken : order?.inputToken
  const solution = solverCompetition && solverCompetition[0]
  const displayAmount =
    displayToken &&
    solution &&
    CurrencyAmount.fromRawAmount(displayToken, isSell ? solution?.buyAmount : solution?.sellAmount)

  const toggleSolvers = () => setShowAllSolvers(!showAllSolvers)

  return (
    <div>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper>
          <img src={progressBarStep3} alt="" />
        </styledEl.ProgressImageWrapper>
      </styledEl.ProgressTopSection>

      <div>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="green" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
        </svg>
        <h2>Transaction completed!</h2>
      </div>

      <h3>Solver auction rankings</h3>
      <p>{solverCompetition?.length} out of 25 solvers submitted a solution</p>

      <table>
        <tbody>
          {solverCompetition?.slice(0, showAllSolvers ? undefined : 3).map((solver, index) => (
            <tr key={solver.solver}>
              <td>{index + 1}</td>
              <td>
                <img
                  src={AMM_LOGOS[solver.solver]?.src || AMM_LOGOS.default.src}
                  alt={`${solver.solver} logo`}
                  width="24"
                  height="24"
                />
              </td>
              <td>{solver.solver}</td>
              <td>{index === 0 && 'Winning solver'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {solverCompetition && solverCompetition.length > 3 && (
        <button onClick={toggleSolvers}>
          {showAllSolvers ? (
            <>
              collapse <PiCaretUp />
            </>
          ) : (
            <>
              view {solverCompetition.length - 3} more <PiCaretDown />
            </>
          )}
        </button>
      )}

      <p>
        You received <img src="usdc_logo.png" alt="USDC logo" /> {displayAmount?.toSignificant(6)}{' '}
        {displayToken?.symbol}
        <br />
        and got an extra +32.12 USDC (~$31.22)
      </p>
    </div>
  )
}

function NextBatchStep({ solverCompetition }: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper>
          <img src={progressBarStep3} alt="" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
        <StepComponent status="done" isFirst={false} step={steps[0]} _index={0} />
        <StepComponent
          status="active"
          isFirst={false}
          step={steps[1]}
          _index={1}
          extraContent={
            <styledEl.Description>
              Your order wasn't a part of the winning solution for this auction. It will be included in the next
              auction.
            </styledEl.Description>
          }
        />
        <StepComponent status="next" isFirst={false} step={steps[2]} _index={2} />
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
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper>
          <img src={progressBarStep3} alt="" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
        <StepComponent status="done" isFirst={false} step={steps[0]} _index={0} />
        <StepComponent
          status="active"
          isFirst={false}
          step={steps[1]}
          _index={1}
          extraContent={
            <styledEl.Description>
              This is taking longer than expected! Solvers are still searching...
            </styledEl.Description>
          }
        />
        <StepComponent status="next" isFirst={false} step={steps[2]} _index={2} />
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function UnfillableStep() {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper>
          <img src={progressBarStep1a} alt="" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
        <StepComponent status="done" isFirst={false} step={steps[0]} _index={0} />
        <StepComponent
          status="error"
          isFirst={false}
          step={steps[1]}
          _index={1}
          extraContent={
            <styledEl.Description>
              Your order's price is currently out of market. You can wait or cancel the order.
            </styledEl.Description>
          }
        />
        <StepComponent status="disabled" isFirst={false} step={steps[2]} _index={2} />
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function SubmissionFailedStep() {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper>
          <img src={progressBarStep2b} alt="" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
        <StepComponent status="done" isFirst={false} step={steps[0]} _index={0} />
        <StepComponent
          status="active"
          isFirst={false}
          step={steps[1]}
          _index={1}
          extraContent={
            <styledEl.Description>
              The order could not be settled on-chain. Solvers are competing to find a new solution...
            </styledEl.Description>
          }
        />
        <StepComponent status="next" isFirst={false} step={steps[2]} _index={2} />
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function CancellingStep() {
  return <div>Your order is being cancelled. TODO: This should show our existing cancellation flow</div>
}

function CancelledStep() {
  return <div>Your order has been cancelled. TODO: This should show our existing cancellation flow</div>
}

function ExpiredStep() {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper>
          <img src={progressBarStep1} alt="" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent />
      </styledEl.ProgressTopSection>
      <div>
        <div>
          <PiClockCountdown />
          <h2>Your order expired</h2>
        </div>
        <div>
          <div>
            <div className="bad" />
            <h3>The bad news</h3>
            <p>Your order expired. This could be due to gas spikes, volatile prices, or problems with the network.</p>
          </div>
          <div>
            <div className="good" />
            <h3>The good news</h3>
            <p>
              Unlike on other exchanges, you won't be charged for this! Feel free to <a>place a new order</a> without
              worry.
            </p>
          </div>
        </div>
        <div>
          If your orders often expire, consider increasing your slippage or <a>contacting us</a> so we can investigate
          the problem.
        </div>
      </div>
    </styledEl.ProgressContainer>
  )
}

function CancellationFailedStep() {
  return <div>Failed to cancel, order executed instead. Oops!</div>
}

type StepCallback = (props: OrderProgressBarV2Props) => React.ReactNode
const STEP_NAME_TO_STEP_COMPONENT: Record<OrderProgressBarStepName, React.ComponentType<OrderProgressBarV2Props>> = {
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

export default OrderProgressBarV2
