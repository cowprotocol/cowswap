import React, { useState, useEffect } from 'react'

import PROGRESS_BAR_BAD_NEWS from '@cowprotocol/assets/cow-swap/progressbar-bad-news.svg'
import PROGRESSBAR_COW_SURPLUS from '@cowprotocol/assets/cow-swap/progressbar-cow-surplus.svg'
import PROGRESS_BAR_GOOD_NEWS from '@cowprotocol/assets/cow-swap/progressbar-good-news.svg'
import STEP_IMAGE_EXECUTING from '@cowprotocol/assets/cow-swap/progressbar-step-executing.svg'
import STEP_IMAGE_SOLVING from '@cowprotocol/assets/cow-swap/progressbar-step-solving.svg'
import STEP_IMAGE_UNFILLABLE from '@cowprotocol/assets/cow-swap/progressbar-step-unfillable.svg'
import STEP_IMAGE_WAIT from '@cowprotocol/assets/cow-swap/progressbar-step-wait.svg'
import ICON_SOCIAL_X from '@cowprotocol/assets/images/icon-social-x.svg'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { isSellOrder } from '@cowprotocol/common-utils'
import type { CompetitionOrderStatus } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { UI } from '@cowprotocol/ui'
import { ProductLogo, ProductVariant } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { MdOutlineMotionPhotosPause } from 'react-icons/md'
import {
  PiDotsThreeCircle,
  PiCheckCircleFill,
  PiSpinnerBallFill,
  PiClockCountdown,
  PiCaretDown,
  PiCaretUp,
  PiTrophyFill,
} from 'react-icons/pi'
import SVG from 'react-inlinesvg'

import { AMM_LOGOS } from 'legacy/components/AMMsLogo'
import { Order } from 'legacy/state/orders/actions'

import { OrderProgressBarStepName } from 'common/hooks/orderProgressBarV2'
import { useGetSurplusData } from 'common/hooks/useGetSurplusFiatValue'

import * as styledEl from './styled'

export type OrderProgressBarV2Props = {
  stepName: OrderProgressBarStepName
  countdown?: number | null | undefined
  solverCompetition?: CompetitionOrderStatus['value']
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
  },
  { title: 'Executing', description: 'The winning solver will execute your order.' },
]

const StepComponent: React.FC<{
  status: string
  isFirst: boolean
  step: { title: string; description?: string }
  _index: number
  extraContent?: React.ReactNode
  customColor?: string
}> = ({ status, isFirst, step, extraContent, customColor }) => (
  <styledEl.Step status={status} isFirst={isFirst}>
    <styledEl.Icon status={status} customColor={customColor}>
      <StatusIcon status={status} customColor={customColor} />
    </styledEl.Icon>
    <styledEl.Content>
      <styledEl.Title customColor={customColor}>
        {step.title}
        {status === 'active' && <styledEl.LoadingEllipsis />}
      </styledEl.Title>
      {extraContent}
    </styledEl.Content>
  </styledEl.Step>
)

const StatusIcon: React.FC<{ status: string; customColor?: string }> = ({ status, customColor }) => {
  const iconColor = customColor || (status === 'done' ? 'green' : 'inherit')

  switch (status) {
    case 'done':
      return <PiCheckCircleFill color={iconColor} />
    case 'active':
      return <PiSpinnerBallFill className="spinner" color={iconColor} />
    case 'error':
    case 'unfillable':
      return <MdOutlineMotionPhotosPause color={iconColor} />
    default:
      return <PiDotsThreeCircle color={iconColor} />
  }
}

const OrderIntent: React.FC<{ order?: Order }> = ({ order }) => {
  if (!order) return null
  const { inputToken, outputToken, kind, sellAmount, buyAmount } = order
  const isSell = isSellOrder(kind)

  const formatAmount = (amount: string, token: Currency | TokenWithLogo) => {
    const currencyAmount = CurrencyAmount.fromRawAmount(token, amount)
    return `${currencyAmount.toSignificant(6)} ${token.symbol}`
  }

  return (
    <styledEl.OriginalOrderIntent>
      <TokenLogo token={inputToken} size={20} />
      {formatAmount(sellAmount, inputToken)} for {isSell ? 'at least' : 'at most'}{' '}
      <TokenLogo token={outputToken} size={20} />
      {formatAmount(buyAmount, outputToken)}
    </styledEl.OriginalOrderIntent>
  )
}

const AnimatedTokens: React.FC<{
  sellToken: Currency | TokenWithLogo | null | undefined
  buyToken: Currency | TokenWithLogo | null | undefined
}> = ({ sellToken, buyToken }) => (
  <styledEl.AnimatedTokensWrapper>
    <styledEl.TokenWrapper position="left">
      <TokenLogo token={sellToken} size={136} />
    </styledEl.TokenWrapper>
    <styledEl.TokenWrapper position="center">
      <TokenLogo token={buyToken} size={136} />
    </styledEl.TokenWrapper>
    <styledEl.TokenWrapper position="right">
      <ProductLogo variant={ProductVariant.CowSwap} theme={'dark'} height={136} logoIconOnly />
    </styledEl.TokenWrapper>
  </styledEl.AnimatedTokensWrapper>
)

interface CircularCountdownProps {
  countdown: number
}

const CircularCountdown: React.FC<CircularCountdownProps> = ({ countdown }) => {
  const radius = 45
  const circumference = 2 * Math.PI * radius

  return (
    <styledEl.CountdownWrapper>
      <styledEl.CircularProgress viewBox="0 0 100 100">
        <styledEl.CircleProgress cx="50" cy="50" r={radius} strokeDasharray={circumference} />
      </styledEl.CircularProgress>
      <styledEl.CountdownText>{countdown}</styledEl.CountdownText>
    </styledEl.CountdownWrapper>
  )
}

export function OrderProgressBarV2(props: OrderProgressBarV2Props) {
  const { stepName, debugMode = false } = props
  const [debugStep, setDebugStep] = useState<OrderProgressBarStepName>(stepName)
  const currentStep = debugMode ? debugStep : stepName
  const StepComponent = STEP_NAME_TO_STEP_COMPONENT[currentStep as keyof typeof STEP_NAME_TO_STEP_COMPONENT]

  return (
    <>
      {StepComponent && <StepComponent {...props} />}
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

function InitialStep({ order }: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper bgColor={'#65D9FF'}>
          <AnimatedTokens sellToken={order?.inputToken} buyToken={order?.outputToken} />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
        <StepComponent
          status="active"
          isFirst={true}
          step={steps[0]}
          _index={0}
          extraContent={
            <styledEl.Description>
              Your order has been submitted and will be included in the next solver auction
            </styledEl.Description>
          }
        />
        <StepComponent
          status="next"
          isFirst={false}
          step={steps[1]}
          _index={1}
          extraContent={
            <styledEl.Description>
              The auction will start! Solvers will be competing to find the best solution for you.
            </styledEl.Description>
          }
        />
        <StepComponent
          status="next"
          isFirst={false}
          step={steps[2]}
          _index={2}
          extraContent={<styledEl.Description>The winning solver will execute your order.</styledEl.Description>}
        />
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function SolvingStep({ order }: OrderProgressBarV2Props) {
  const [countdown, setCountdown] = useState(15)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => (prevCountdown > 1 ? prevCountdown - 1 : 15))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper bgColor={'#65D9FF'} padding={'24px'}>
          <SVG src={STEP_IMAGE_SOLVING} />
          <CircularCountdown countdown={countdown} />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
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
              The auction has started! Solvers are competing to find the best solution for you...
              <br />
              <styledEl.Link href="#" target="_blank">
                Learn more ↗
              </styledEl.Link>
            </styledEl.Description>
          }
        />
        <StepComponent
          status="next"
          isFirst={false}
          step={steps[2]}
          _index={2}
          extraContent={<styledEl.Description>The winning solver will execute your order.</styledEl.Description>}
        />
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function ExecutingStep({ solverCompetition, order }: OrderProgressBarV2Props) {
  const solversCount = solverCompetition?.length || 0

  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper bgColor={'#65D9FF'} padding={'42px 24px'}>
          <SVG src={STEP_IMAGE_EXECUTING} />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
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
                {solversCount} solver{solversCount !== 1 && 's'}{' '}
              </strong>{' '}
              joined the competition!
              <br />
              The winner will submit your order on-chain.
            </styledEl.Description>
          }
        />
        <StepComponent
          status="next"
          isFirst={false}
          step={{ title: 'Transaction completed' }}
          _index={2}
          extraContent={<styledEl.Description>You'll receive the settlement in your wallet.</styledEl.Description>}
        />
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

// TEMP =============================
const mockSolvers = [
  { solver: 'Naive', logo: 'naive-logo.png' },
  { solver: 'Gnosis_1inch', logo: 'gnosis-1inch-logo.png' },
  { solver: 'Baseline', logo: 'baseline-logo.png' },
  { solver: 'ParaSwap', logo: 'paraswap-logo.png' },
  { solver: 'CowDex', logo: 'cowdex-logo.png' },
  { solver: 'MegaSolver', logo: 'megasolver-logo.png' },
  { solver: 'QuickSwap', logo: 'quickswap-logo.png' },
  { solver: 'OptimizedDEX', logo: 'optimizeddex-logo.png' },
  { solver: 'FlashSolve', logo: 'flashsolve-logo.png' },
  { solver: 'LiquidityPro', logo: 'liquiditypro-logo.png' },
]
// END TEMP ==========================

interface FinishedStepProps {
  solverCompetition?: CompetitionOrderStatus['value']
  order?: Order
  cancellationFailed?: boolean
}

export const FinishedStep: React.FC<FinishedStepProps> = ({ solverCompetition, order, cancellationFailed }) => {
  const [showAllSolvers, setShowAllSolvers] = useState(false)
  const { surplusFiatValue, surplusPercent } = useGetSurplusData(order)

  const toggleSolvers = () => setShowAllSolvers(!showAllSolvers)

  // TODO: Don't use mock data if no solverCompetition is provided
  const solvers = solverCompetition?.length ? solverCompetition : mockSolvers
  const visibleSolvers = showAllSolvers ? solvers : solvers.slice(0, 3)

  return (
    <styledEl.FinishedStepContainer>
      {cancellationFailed && (
        <styledEl.CancellationFailedBanner>
          <b>Cancellation failed:</b> The order was executed before it could be cancelled.
        </styledEl.CancellationFailedBanner>
      )}
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper bgColor={'#65D9FF'}>
          <styledEl.ShareButton>
            <SVG src={ICON_SOCIAL_X} />
            <span>Share this win!</span>
          </styledEl.ShareButton>
          <styledEl.FinishedLogo>
            <ProductLogo
              variant={ProductVariant.CowSwap}
              theme="light"
              overrideColor={UI.COLOR_PRIMARY_DARKER}
              height={19}
            />
          </styledEl.FinishedLogo>
          <styledEl.FinishedTagLine>
            ...gets you <b>moooooore.</b>
          </styledEl.FinishedTagLine>
          <styledEl.CowImage>
            <SVG src={PROGRESSBAR_COW_SURPLUS} />
          </styledEl.CowImage>
          <styledEl.TokenPairTitle>
            <span>Swap order</span>
            <b>{order ? `${order.inputToken.symbol}/${order.outputToken.symbol}` : 'N/A'}</b>
          </styledEl.TokenPairTitle>
          <styledEl.TokenImages>
            <TokenLogo token={order?.inputToken} size={34} />
            <TokenLogo token={order?.outputToken} size={34} />
          </styledEl.TokenImages>
          <styledEl.Surplus>
            <span>Your surplus</span>
            {surplusPercent ? <b>+{parseFloat(surplusPercent).toFixed(2)}%</b> : <b>N/A</b>}
          </styledEl.Surplus>
        </styledEl.ProgressImageWrapper>
      </styledEl.ProgressTopSection>

      <styledEl.ConclusionContent>
        <styledEl.TransactionStatus>
          <PiCheckCircleFill />
          Transaction completed!
        </styledEl.TransactionStatus>

        <styledEl.SolverRankings>
          <h3>Solver auction rankings</h3>
          <p>
            <b>{solvers.length}</b> out of <b>25</b> solvers submitted a solution
          </p>

          <styledEl.SolverTable>
            <tbody>
              {visibleSolvers.map((solver: any, index: number) => (
                <styledEl.SolverTableRow key={`${solver.solver}-${index}`} isWinner={index === 0}>
                  <styledEl.SolverRank isFirst>{index + 1}</styledEl.SolverRank>
                  <styledEl.SolverTableCell isSecond>
                    <styledEl.SolverInfo>
                      <styledEl.SolverLogo>
                        <img
                          src={
                            AMM_LOGOS[solver.solver]?.src ||
                            AMM_LOGOS.default.src ||
                            ('logo' in solver ? solver.logo : undefined)
                          }
                          alt={`${solver.solver} logo`}
                          width="24"
                          height="24"
                        />
                      </styledEl.SolverLogo>
                      <styledEl.SolverName>{solver.solver}</styledEl.SolverName>
                    </styledEl.SolverInfo>
                  </styledEl.SolverTableCell>
                  <styledEl.SolverTableCell isLast>
                    {index === 0 && (
                      <styledEl.WinningBadge>
                        <styledEl.TrophyIcon>
                          <PiTrophyFill />
                        </styledEl.TrophyIcon>
                        <span>Winning solver</span>
                      </styledEl.WinningBadge>
                    )}
                  </styledEl.SolverTableCell>
                </styledEl.SolverTableRow>
              ))}
            </tbody>
          </styledEl.SolverTable>

          {solvers.length > 3 && (
            <styledEl.ViewMoreButton onClick={toggleSolvers}>
              {showAllSolvers ? (
                <>
                  Collapse <PiCaretUp />
                </>
              ) : (
                <>
                  View {solvers.length - 3} more <PiCaretDown />
                </>
              )}
            </styledEl.ViewMoreButton>
          )}
        </styledEl.SolverRankings>
        {order && (
          <styledEl.ReceivedAmount>
            You received <TokenLogo token={order.outputToken} size={16} />{' '}
            <b>
              {order.kind === 'sell'
                ? CurrencyAmount.fromRawAmount(
                    order.outputToken,
                    order.apiAdditionalInfo?.executedBuyAmount || order.buyAmount || '0'
                  ).toSignificant(6)
                : CurrencyAmount.fromRawAmount(
                    order.outputToken,
                    order.apiAdditionalInfo?.executedSellAmount || order.sellAmount || '0'
                  ).toSignificant(6)}{' '}
              {order.outputToken.symbol}
            </b>
          </styledEl.ReceivedAmount>
        )}
        {surplusFiatValue ? (
          <styledEl.ExtraAmount>
            and got an extra <i>+{surplusFiatValue.toFixed(2)} USDC</i> (~${surplusFiatValue.toFixed(2)})
          </styledEl.ExtraAmount>
        ) : null}
        {/*TODO: Add states for when there's no surplus and/or when there's a custom recipient*/}
      </styledEl.ConclusionContent>
    </styledEl.FinishedStepContainer>
  )
}

function NextBatchStep({ solverCompetition, order }: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper bgColor={'#FFDB9C'} padding={'40px 20px 0'}>
          <img src={STEP_IMAGE_WAIT} alt="Order unfillable" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
        <StepComponent status="done" isFirst={false} step={steps[0]} _index={0} />
        <StepComponent
          status="active"
          isFirst={false}
          step={{ ...steps[1], title: 'Solving: Finding new solution' }}
          _index={1}
          customColor={'#996815'}
          extraContent={
            <styledEl.Description>
              The <strong>Gnosis_1inch</strong> solver had the best solution for this batch. Unfortunately, your order
              wasn't part of their winning solution, so we're waiting for solvers to find a new solution that includes
              your order for the next batch.{' '}
              <styledEl.Link href="#" target={'_blank'}>
                Learn more ↗
              </styledEl.Link>
            </styledEl.Description>
          }
        />
        <StepComponent
          status="next"
          isFirst={false}
          step={steps[2]}
          _index={2}
          extraContent={<styledEl.Description>The winning solver will execute your order.</styledEl.Description>}
        />
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
                      {entry?.executedAmounts && ' <- your order was included in this solution'}
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

function DelayedStep({ order }: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper bgColor={'#65D9FF'} padding={'24px'}>
          <SVG src={STEP_IMAGE_SOLVING} />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
        <StepComponent status="done" isFirst={false} step={steps[0]} _index={0} />
        <StepComponent
          status="active"
          isFirst={false}
          step={{ ...steps[1], title: 'Solving: Still searching' }}
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

function UnfillableStep({ order }: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper bgColor={'#FFDB9C'} padding={'20px 0 0'}>
          <img src={STEP_IMAGE_UNFILLABLE} alt="Order unfillable" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
        <StepComponent status="done" isFirst={false} step={steps[0]} _index={0} />
        <StepComponent
          status="unfillable"
          isFirst={false}
          step={{ ...steps[1], title: 'Solving: out of market' }}
          _index={1}
          customColor={'#996815'}
          extraContent={
            <styledEl.Description>
              Your order's price is currently out of market. You can either wait or{' '}
              <styledEl.Link href={'#'} underline>
                cancel the order
              </styledEl.Link>
              .
            </styledEl.Description>
          }
        />
        <StepComponent
          status="disabled"
          isFirst={false}
          step={steps[2]}
          _index={2}
          extraContent={<styledEl.Description>The winning solver will execute your order.</styledEl.Description>}
        />
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function SubmissionFailedStep({ order }: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper bgColor={'#FFDB9C'} padding={'40px 20px 0'}>
          <img src={STEP_IMAGE_WAIT} alt="Submission failed" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
        <StepComponent status="done" isFirst={false} step={steps[0]} _index={0} />
        <StepComponent
          status="active"
          isFirst={false}
          step={{ ...steps[1], title: 'Solving: Finding new solution' }}
          _index={1}
          customColor={'#996815'}
          extraContent={
            <styledEl.Description>
              The order could not be settled on-chain. Solvers are competing to find a new solution.
            </styledEl.Description>
          }
        />
        <StepComponent
          status="next"
          isFirst={false}
          step={steps[2]}
          _index={2}
          extraContent={<styledEl.Description>The winning solver will execute your order.</styledEl.Description>}
        />
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function CancellingStep({ order }: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper bgColor={'#FFDB9C'} padding={'40px 20px 0'}>
          <img src={STEP_IMAGE_WAIT} alt="Cancelling order" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
        <StepComponent status="done" isFirst={false} step={steps[0]} _index={0} />
        <StepComponent
          status="active"
          isFirst={false}
          step={{ ...steps[1], title: 'Cancelling order' }}
          _index={1}
          customColor={`var(${UI.COLOR_DANGER_TEXT})`}
          extraContent={<styledEl.Description>Your order is being cancelled.</styledEl.Description>}
        />
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function CancelledStep({ order }: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper bgColor={'#FFDB9C'} padding={'40px 20px 0'}>
          <img src={STEP_IMAGE_WAIT} alt="Order cancelled" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
      </styledEl.ProgressTopSection>
      <styledEl.TransactionStatus status={'cancelled'}>
        <PiCheckCircleFill />
        Your order was cancelled
      </styledEl.TransactionStatus>

      <styledEl.Description center margin="10px auto">
        Your order was successfully cancelled.
      </styledEl.Description>
    </styledEl.ProgressContainer>
  )
}

function ExpiredStep({ order }: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper bgColor={'#FFDB9C'} padding={'40px 20px 0'}>
          <img src={STEP_IMAGE_WAIT} alt="Order expired" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
      </styledEl.ProgressTopSection>
      <styledEl.TransactionStatus status={'expired'}>
        <PiClockCountdown />
        Your order expired
      </styledEl.TransactionStatus>

      <styledEl.CardWrapper>
        <styledEl.InfoCard variant="warning">
          <SVG src={PROGRESS_BAR_BAD_NEWS} height={38} />
          <h3>The bad news</h3>
          <p>Your order expired. This could be due to gas spikes, volatile prices, or problems with the network.</p>
        </styledEl.InfoCard>
        <styledEl.InfoCard variant="success">
          <SVG src={PROGRESS_BAR_GOOD_NEWS} height={38} />
          <h3>The good news</h3>
          <p>
            Unlike on other exchanges, you won't be charged for this! Feel free to{' '}
            <styledEl.Link href="#" underline>
              place a new order
            </styledEl.Link>{' '}
            without worry.
          </p>
        </styledEl.InfoCard>
      </styledEl.CardWrapper>

      <styledEl.Description center margin="10px 0">
        If your orders often expire, consider increasing your slippage or{' '}
        <styledEl.Link href="#" target="_blank">
          contacting us
        </styledEl.Link>{' '}
        so we can investigate the problem.
      </styledEl.Description>
    </styledEl.ProgressContainer>
  )
}

type StepNameWithoutSolved = Exclude<OrderProgressBarStepName, 'solved'>
const STEP_NAME_TO_STEP_COMPONENT: Record<StepNameWithoutSolved, React.ComponentType<OrderProgressBarV2Props>> = {
  initial: InitialStep,
  solving: SolvingStep,
  executing: ExecutingStep,
  finished: FinishedStep,
  nextBatch: NextBatchStep,
  delayed: DelayedStep,
  unfillable: UnfillableStep,
  submissionFailed: SubmissionFailedStep,
  cancelling: CancellingStep,
  cancelled: CancelledStep,
  expired: ExpiredStep,
  cancellationFailed: (props) => <FinishedStep {...props} cancellationFailed={true} />,
}

export default OrderProgressBarV2
