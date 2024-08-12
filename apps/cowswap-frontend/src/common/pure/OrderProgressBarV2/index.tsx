import React, { useState } from 'react'

import PROGRESS_BAR_BAD_NEWS from '@cowprotocol/assets/cow-swap/progressbar-bad-news.svg'
import PROGRESSBAR_COW_SURPLUS from '@cowprotocol/assets/cow-swap/progressbar-cow-surplus.svg'
import PROGRESS_BAR_GOOD_NEWS from '@cowprotocol/assets/cow-swap/progressbar-good-news.svg'
import STEP_IMAGE_EXECUTING from '@cowprotocol/assets/cow-swap/progressbar-step-executing.svg'
import STEP_IMAGE_SOLVING from '@cowprotocol/assets/cow-swap/progressbar-step-solving.svg'
import STEP_IMAGE_UNFILLABLE from '@cowprotocol/assets/cow-swap/progressbar-step-unfillable.svg'
import STEP_IMAGE_WAIT from '@cowprotocol/assets/cow-swap/progressbar-step-wait.svg'
import ICON_SOCIAL_X from '@cowprotocol/assets/images/icon-social-x.svg'
import LOTTIE_GREEN_CHECKMARK_DARK from '@cowprotocol/assets/lottie/green-checkmark-dark.json'
import LOTTIE_GREEN_CHECKMARK from '@cowprotocol/assets/lottie/green-checkmark.json'
import LOTTIE_RED_CROSS from '@cowprotocol/assets/lottie/red-cross.json'
import LOTTIE_TIME_EXPIRED_DARK from '@cowprotocol/assets/lottie/time-expired-dark.json'
import LOTTIE_TIME_EXPIRED from '@cowprotocol/assets/lottie/time-expired.json'
import LOTTIE_YELLOW_CHECKMARK_DARK from '@cowprotocol/assets/lottie/yellow-checkmark-dark.json'
import LOTTIE_YELLOW_CHECKMARK from '@cowprotocol/assets/lottie/yellow-checkmark.json'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink, isSellOrder, shortenAddress } from '@cowprotocol/common-utils'
import type { CompetitionOrderStatus, SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { ExternalLink, ProductLogo, ProductVariant, TokenAmount, UI } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import Lottie from 'lottie-react'
import { MdOutlineMotionPhotosPause } from 'react-icons/md'
import {
  PiCaretDown,
  PiCaretUp,
  PiCheckCircleFill,
  PiDotsThreeCircle,
  PiSpinnerBallFill,
  PiTrophyFill,
} from 'react-icons/pi'
import SVG from 'react-inlinesvg'

import { AMM_LOGOS } from 'legacy/components/AMMsLogo'
import { Order } from 'legacy/state/orders/actions'

import { OrderProgressBarStepName, PROGRESS_BAR_TIMER_DURATION } from 'common/hooks/orderProgressBarV2'
import { SurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { useTheme } from 'common/hooks/useTheme'
import { getIsCustomRecipient } from 'utils/orderUtils/getIsCustomRecipient'

import * as styledEl from './styled'

import { CancelButton } from '../CancelButton'

export type OrderProgressBarV2Props = {
  stepName: OrderProgressBarStepName
  chainId: SupportedChainId
  countdown?: number | null | undefined
  solverCompetition?: CompetitionOrderStatus['value']
  order?: Order
  debugMode?: boolean
  showCancellationModal: Command | null
  surplusData?: SurplusData
  receiverEnsName?: string
}

const STEPS = [
  {
    title: 'Placing order',
    description: 'Your order has been submitted and will be included in the next solver auction',
  },
  {
    title: 'Solving',
  },
  { title: 'Executing', description: 'The winning solver will execute your order.' },
]

// TODO: move to another file?
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
  const theme = useTheme()
  const iconColor = customColor || (status === 'done' ? 'green' : 'inherit')

  switch (status) {
    case 'done':
      return <PiCheckCircleFill color={iconColor} />
    case 'active':
      return <PiSpinnerBallFill className="spinner" color={iconColor} />
    case 'error':
    case 'unfillable':
      return <MdOutlineMotionPhotosPause color={iconColor} />
    case 'cancelling':
      return (
        <Lottie
          animationData={theme.darkMode ? LOTTIE_RED_CROSS : LOTTIE_RED_CROSS} // TODO: Get dark mode animation icon
          loop={true}
          autoplay={true}
          style={{ width: '24px', height: '24px' }}
        />
      )
    default:
      return <PiDotsThreeCircle color={iconColor} />
  }
}

const OrderIntent: React.FC<{ order?: Order }> = ({ order }) => {
  if (!order) return null

  const { inputToken, outputToken, kind, sellAmount, buyAmount } = order
  const isSell = isSellOrder(kind)

  const sellCurrencyAmount = CurrencyAmount.fromRawAmount(inputToken, sellAmount)
  const buyCurrencyAmount = CurrencyAmount.fromRawAmount(outputToken, buyAmount)

  const sellTokenPart = (
    <>
      <TokenLogo token={inputToken} size={20} />
      <TokenAmount amount={sellCurrencyAmount} tokenSymbol={inputToken} />
    </>
  )

  const buyTokenPart = (
    <>
      <TokenLogo token={outputToken} size={20} />
      <TokenAmount amount={buyCurrencyAmount} tokenSymbol={outputToken} />
    </>
  )

  return (
    <styledEl.OriginalOrderIntent>
      {isSell ? (
        <>
          {sellTokenPart} for at least {buyTokenPart}
        </>
      ) : (
        <>
          {buyTokenPart} for at most {sellTokenPart}
        </>
      )}
    </styledEl.OriginalOrderIntent>
  )
}

const AnimatedTokens: React.FC<{
  sellToken: Currency | TokenWithLogo | null | undefined
  buyToken: Currency | TokenWithLogo | null | undefined
}> = ({ sellToken, buyToken }) => {
  const theme = useTheme()
  const backgroundImage = theme.darkMode
    ? 'url(assets/images/background-cowswap-darkmode.svg)'
    : 'url(assets/images/background-cowswap-lightmode.svg)'

  return (
    <styledEl.AnimatedTokensWrapper style={{ backgroundImage }}>
      <styledEl.TokenWrapper position="left">
        <TokenLogo token={sellToken} size={136} />
      </styledEl.TokenWrapper>
      <styledEl.TokenWrapper position="center">
        <TokenLogo token={buyToken} size={136} />
      </styledEl.TokenWrapper>
      <styledEl.TokenWrapper position="right">
        <ProductLogo
          variant={ProductVariant.CowSwap}
          theme={theme.darkMode ? 'dark' : 'light'}
          height={136}
          logoIconOnly
        />
      </styledEl.TokenWrapper>
    </styledEl.AnimatedTokensWrapper>
  )
}

interface CircularCountdownProps {
  countdown: number
}

const CircularCountdown: React.FC<CircularCountdownProps> = ({ countdown }) => {
  const radius = 45
  const circumference = 2 * Math.PI * radius

  return (
    <styledEl.CountdownWrapper>
      <styledEl.CircularProgress viewBox="0 0 100 100">
        <styledEl.CircleProgress
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          duration={countdown}
          max={PROGRESS_BAR_TIMER_DURATION}
        />
      </styledEl.CircularProgress>
      <styledEl.CountdownText>{countdown}</styledEl.CountdownText>
    </styledEl.CountdownWrapper>
  )
}

export function OrderProgressBarV2(props: OrderProgressBarV2Props) {
  const { stepName, debugMode = true } = props
  const [debugStep, setDebugStep] = useState<OrderProgressBarStepName>(stepName)
  const currentStep = debugMode ? debugStep : stepName
  console.log('OrderProgressBarV2 - currentStep:', currentStep)

  let StepComponent: React.ComponentType<OrderProgressBarV2Props> | null = null

  if (currentStep === 'cancellationFailed' || currentStep === 'finished') {
    StepComponent = FinishedStep
  } else {
    StepComponent = STEP_NAME_TO_STEP_COMPONENT[currentStep as keyof typeof STEP_NAME_TO_STEP_COMPONENT] || null
  }

  return (
    <>
      {StepComponent && <StepComponent {...props} stepName={currentStep} />}
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
          step={STEPS[0]}
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
          step={STEPS[1]}
          _index={1}
          extraContent={
            <styledEl.Description>
              The auction will start! Solvers will be competing to find the best solution for you.
            </styledEl.Description>
          }
        />
        <StepComponent status="next" isFirst={false} step={STEPS[2]} _index={2} />
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function SolvingStep({ order, countdown }: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper bgColor={'#65D9FF'} padding={'24px'}>
          <SVG src={STEP_IMAGE_SOLVING} />
          <CircularCountdown countdown={countdown || 0} />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
        <StepComponent status="done" isFirst={false} step={STEPS[0]} _index={0} />
        <StepComponent
          status="active"
          isFirst={false}
          step={STEPS[1]}
          _index={1}
          extraContent={
            <styledEl.Description>
              The auction has started! Solvers are competing to find the best solution for you...
              <br />
              <styledEl.Link href="#" target="_blank">
                {/*TODO: add competition learn more link*/}
                Learn more ↗
              </styledEl.Link>
            </styledEl.Description>
          }
        />
        <StepComponent
          status="next"
          isFirst={false}
          step={STEPS[2]}
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
        <StepComponent status="done" isFirst={false} step={STEPS[0]} _index={0} />
        <StepComponent
          status="active"
          isFirst={false}
          step={{ ...STEPS[1], title: 'Executing' }}
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
        <StepComponent status="next" isFirst={false} step={{ title: 'Transaction completed' }} _index={2} />
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function FinishedStep({
  stepName,
  solverCompetition: solvers,
  order,
  surplusData,
  chainId,
  receiverEnsName,
}: OrderProgressBarV2Props) {
  const [showAllSolvers, setShowAllSolvers] = useState(false)
  const { surplusFiatValue, surplusPercent, surplusAmount, showSurplus } = surplusData || {}
  const cancellationFailed = stepName === 'cancellationFailed'
  console.log('FinishedStep - cancellationFailed:', cancellationFailed)

  const toggleSolvers = () => setShowAllSolvers(!showAllSolvers)

  const visibleSolvers = (showAllSolvers ? solvers : solvers?.slice(0, 3)) || []
  const isSell = order && isSellOrder(order.kind)
  const isCustomRecipient = order && getIsCustomRecipient(order)
  const receiver = order?.receiver || order?.owner

  const theme = useTheme()

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
            {showSurplus ? (
              <>
                ...gets you <b>moooooore.</b>
              </>
            ) : (
              <>
                Did you <b>know?</b>
              </>
            )}
          </styledEl.FinishedTagLine>
          <styledEl.CowImage>
            <SVG src={PROGRESSBAR_COW_SURPLUS} />
          </styledEl.CowImage>
          {showSurplus && (
            <>
              <styledEl.TokenPairTitle>
                <span>Swap order</span>
                <b>{order ? `${order.inputToken.symbol}/${order.outputToken.symbol}` : 'N/A'}</b>
              </styledEl.TokenPairTitle>
              <styledEl.TokenImages>
                <TokenLogo token={order?.inputToken} size={34} />
                <TokenLogo token={order?.outputToken} size={34} />
              </styledEl.TokenImages>
            </>
          )}
          <styledEl.Surplus showSurplus={!!showSurplus}>
            {showSurplus ? (
              <>
                <span>Your surplus</span>
                {surplusPercent ? <b>+{parseFloat(surplusPercent).toFixed(2)}%</b> : <b>N/A</b>}
              </>
            ) : (
              <>
                <span>Unlike other exchanges, here you don't pay any fees if your trade fails.</span>
              </>
            )}
          </styledEl.Surplus>
        </styledEl.ProgressImageWrapper>
      </styledEl.ProgressTopSection>

      <styledEl.ConclusionContent>
        <styledEl.TransactionStatus flexFlow="column">
          <Lottie
            animationData={theme.darkMode ? LOTTIE_GREEN_CHECKMARK_DARK : LOTTIE_GREEN_CHECKMARK}
            loop={false}
            autoplay
            style={{ width: '56px', height: '56px' }}
          />
          Transaction completed!
        </styledEl.TransactionStatus>

        {solvers && solvers.length > 0 && (
          <styledEl.SolverRankings>
            <h3>Solver auction rankings</h3>
            <p>
              <b>{solvers.length} out of 25 solvers</b> submitted a solution
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
        )}
        {order?.apiAdditionalInfo?.executedBuyAmount && (
          <styledEl.ReceivedAmount>
            {!isCustomRecipient && 'You received '}
            <TokenLogo token={order.outputToken} size={16} />
            <b>
              <TokenAmount
                amount={CurrencyAmount.fromRawAmount(order.outputToken, order.apiAdditionalInfo.executedBuyAmount)}
                tokenSymbol={order.outputToken}
              />
            </b>{' '}
            {isCustomRecipient && receiver && (
              <>
                was sent to
                <ExternalLink href={getExplorerLink(chainId, receiver, ExplorerDataType.ADDRESS)}>
                  {receiverEnsName || shortenAddress(receiver)} ↗
                </ExternalLink>
              </>
            )}
          </styledEl.ReceivedAmount>
        )}
        {showSurplus ? (
          <styledEl.ExtraAmount>
            {getSurplusText(isSell, isCustomRecipient)}
            <i>
              +<TokenAmount amount={surplusAmount} tokenSymbol={surplusAmount?.currency} />
            </i>{' '}
            {surplusFiatValue && +surplusFiatValue.toFixed(2) > 0 && <>(~${surplusFiatValue.toFixed(2)})</>}
          </styledEl.ExtraAmount>
        ) : null}
      </styledEl.ConclusionContent>
    </styledEl.FinishedStepContainer>
  )
}

function getSurplusText(isSell: boolean | undefined, isCustomRecipient: boolean | undefined): string {
  if (isSell) {
    if (isCustomRecipient) {
      return 'including an extra '
    }
    return 'and got an extra '
  }
  return 'and saved '
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
        <StepComponent status="done" isFirst={false} step={STEPS[0]} _index={0} />
        <StepComponent
          status="active"
          isFirst={false}
          step={{ ...STEPS[1], title: 'Solving: Finding new solution' }}
          _index={1}
          customColor={`var(${UI.COLOR_ALERT_TEXT})`}
          extraContent={
            <styledEl.Description>
              {solverCompetition?.length && (
                <>
                  The <strong>{solverCompetition[0].solver}</strong> solver had the best solution for this batch.
                </>
              )}{' '}
              Unfortunately, your order wasn't part of their winning solution, so we're waiting for solvers to find a
              new solution that includes your order for the next batch.{' '}
              <styledEl.Link href="#" target={'_blank'}>
                {/*TODO: add learn more link*/}
                Learn more ↗
              </styledEl.Link>
            </styledEl.Description>
          }
        />
        <StepComponent
          status="next"
          isFirst={false}
          step={STEPS[2]}
          _index={2}
          extraContent={<styledEl.Description>The winning solver will execute your order.</styledEl.Description>}
        />
      </styledEl.StepsWrapper>
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
        <StepComponent status="done" isFirst={false} step={STEPS[0]} _index={0} />
        <StepComponent
          status="active"
          isFirst={false}
          step={{ ...STEPS[1], title: 'Solving: Still searching' }}
          _index={1}
          extraContent={
            <styledEl.Description>
              This is taking longer than expected! Solvers are still searching...
            </styledEl.Description>
          }
        />
        <StepComponent status="next" isFirst={false} step={STEPS[2]} _index={2} />
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function UnfillableStep({ order, showCancellationModal }: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper bgColor={'#FFDB9C'} padding={'20px 0 0'}>
          <img src={STEP_IMAGE_UNFILLABLE} alt="Order unfillable" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
        <StepComponent status="done" isFirst={false} step={STEPS[0]} _index={0} />
        <StepComponent
          status="unfillable"
          isFirst={false}
          step={{ ...STEPS[1], title: 'Solving: out of market' }}
          _index={1}
          customColor={`var(${UI.COLOR_ALERT_TEXT})`}
          extraContent={
            <styledEl.Description>
              Your order's price is currently out of market.{' '}
              {showCancellationModal && (
                <>
                  You can either wait or <CancelButton onClick={showCancellationModal}>cancel the order</CancelButton>.
                </>
              )}
            </styledEl.Description>
          }
        />
        <StepComponent
          status="disabled"
          isFirst={false}
          step={STEPS[2]}
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
        <StepComponent status="done" isFirst={false} step={STEPS[0]} _index={0} />
        <StepComponent
          status="active"
          isFirst={false}
          step={{ ...STEPS[1], title: 'Solving: Finding new solution' }}
          _index={1}
          customColor={`var(${UI.COLOR_ALERT_TEXT})`}
          extraContent={
            <styledEl.Description>
              The order could not be settled on-chain. Solvers are competing to find a new solution.
            </styledEl.Description>
          }
        />
        <StepComponent
          status="next"
          isFirst={false}
          step={STEPS[2]}
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
        <StepComponent status="done" isFirst={false} step={STEPS[0]} _index={0} />
        <StepComponent
          status="cancelling"
          isFirst={false}
          step={{ ...STEPS[1], title: 'Cancelling order' }}
          _index={1}
          customColor={`var(${UI.COLOR_DANGER_TEXT})`}
          extraContent={<styledEl.Description>Your order is being cancelled.</styledEl.Description>}
        />
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function CancelledStep({ order }: OrderProgressBarV2Props) {
  const theme = useTheme()

  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper bgColor={'#FFDB9C'} padding={'40px 20px 0'}>
          <img src={STEP_IMAGE_WAIT} alt="Order cancelled" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
      </styledEl.ProgressTopSection>
      <styledEl.ConclusionContent>
        <styledEl.TransactionStatus status={'cancelled'} flexFlow="column">
          <Lottie
            animationData={theme.darkMode ? LOTTIE_YELLOW_CHECKMARK_DARK : LOTTIE_YELLOW_CHECKMARK}
            loop={false}
            autoplay
            style={{ width: '56px', height: '56px' }}
          />
          Your order was cancelled
        </styledEl.TransactionStatus>
      </styledEl.ConclusionContent>

      <styledEl.Description center margin="10px auto 40px">
        Your order was successfully cancelled.
      </styledEl.Description>
    </styledEl.ProgressContainer>
  )
}

function ExpiredStep({ order }: OrderProgressBarV2Props) {
  const theme = useTheme()

  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper bgColor={'#FFDB9C'} padding={'40px 20px 0'}>
          <img src={STEP_IMAGE_WAIT} alt="Order expired" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
      </styledEl.ProgressTopSection>
      <styledEl.ConclusionContent>
        <styledEl.TransactionStatus status={'expired'} flexFlow="column">
          <Lottie
            animationData={theme.darkMode ? LOTTIE_TIME_EXPIRED_DARK : LOTTIE_TIME_EXPIRED}
            loop={false}
            autoplay
            style={{ width: '56px', height: '56px' }}
          />
          Your order expired
        </styledEl.TransactionStatus>
      </styledEl.ConclusionContent>

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
              {/*TODO: add link to new order*/}
              place a new order
            </styledEl.Link>{' '}
            without worry.
          </p>
        </styledEl.InfoCard>
      </styledEl.CardWrapper>

      <styledEl.Description center margin="10px 0">
        If your orders often expire, consider increasing your slippage or{' '}
        <styledEl.Link href="#" target="_blank">
          {/*TODO: add contact us link*/}
          contacting us
        </styledEl.Link>{' '}
        so we can investigate the problem.
      </styledEl.Description>
    </styledEl.ProgressContainer>
  )
}

const STEP_NAME_TO_STEP_COMPONENT: Record<OrderProgressBarStepName, React.ComponentType<OrderProgressBarV2Props>> = {
  initial: InitialStep,
  solving: SolvingStep,
  executing: ExecutingStep,
  finished: FinishedStep,
  solved: NextBatchStep, // for now just show nextBatch view
  nextBatch: NextBatchStep,
  delayed: DelayedStep,
  unfillable: UnfillableStep,
  submissionFailed: SubmissionFailedStep,
  cancelling: CancellingStep,
  cancelled: CancelledStep,
  expired: ExpiredStep,
  cancellationFailed: FinishedStep,
}
