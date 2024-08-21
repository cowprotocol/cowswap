import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'

import PROGRESS_BAR_BAD_NEWS from '@cowprotocol/assets/cow-swap/progressbar-bad-news.svg'
import PROGRESSBAR_COW_SURPLUS_1 from '@cowprotocol/assets/cow-swap/progressbar-finished-image-1.svg'
import PROGRESSBAR_COW_SURPLUS_2 from '@cowprotocol/assets/cow-swap/progressbar-finished-image-2.svg'
import PROGRESSBAR_COW_SURPLUS_3 from '@cowprotocol/assets/cow-swap/progressbar-finished-image-3.svg'
import PROGRESSBAR_COW_SURPLUS_4 from '@cowprotocol/assets/cow-swap/progressbar-finished-image-4.svg'
import PROGRESS_BAR_GOOD_NEWS from '@cowprotocol/assets/cow-swap/progressbar-good-news.svg'
import STEP_IMAGE_CANCELLED from '@cowprotocol/assets/cow-swap/progressbar-step-cancelled.svg'
import STEP_IMAGE_EXPIRED from '@cowprotocol/assets/cow-swap/progressbar-step-expired.svg'
import STEP_IMAGE_SOLVING from '@cowprotocol/assets/cow-swap/progressbar-step-solving.svg'
import STEP_IMAGE_UNFILLABLE from '@cowprotocol/assets/cow-swap/progressbar-step-unfillable.svg'
import SWEAT_DROP from '@cowprotocol/assets/cow-swap/sweat-drop.svg'
import ICON_SOCIAL_X from '@cowprotocol/assets/images/icon-social-x.svg'
import LOTTIE_GREEN_CHECKMARK_DARK from '@cowprotocol/assets/lottie/green-checkmark-dark.json'
import LOTTIE_GREEN_CHECKMARK from '@cowprotocol/assets/lottie/green-checkmark.json'
import STEP_LOTTIE_EXECUTING from '@cowprotocol/assets/lottie/progressbar-step-executing.json'
import STEP_LOTTIE_NEXTBATCH from '@cowprotocol/assets/lottie/progressbar-step-nextbatch.json'
import LOTTIE_RED_CROSS from '@cowprotocol/assets/lottie/red-cross.json'
import LOTTIE_TIME_EXPIRED_DARK from '@cowprotocol/assets/lottie/time-expired-dark.json'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink, getRandomInt, isSellOrder, shortenAddress } from '@cowprotocol/common-utils'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { ExternalLink, ProductLogo, ProductVariant, TokenAmount, UI } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import Lottie from 'lottie-react'
import { PiCaretDown, PiCaretUp, PiTrophyFill } from 'react-icons/pi'
import SVG from 'react-inlinesvg'
import { Textfit } from 'react-textfit'

import { AMM_LOGOS } from 'legacy/components/AMMsLogo'
import { Order } from 'legacy/state/orders/actions'
import { useIsDarkMode } from 'legacy/state/user/hooks'

import { cowAnalytics, Category } from 'modules/analytics'

import { OrderProgressBarStepName, SolverCompetition } from 'common/hooks/orderProgressBarV2'
import { SurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { getIsCustomRecipient } from 'utils/orderUtils/getIsCustomRecipient'

import * as styledEl from './styled'
const IS_DEBUG_MODE = true
const DEBUG_FORCE_SHOW_SURPLUS = false

export type OrderProgressBarV2Props = {
  stepName?: OrderProgressBarStepName
  chainId: SupportedChainId
  countdown?: number | null | undefined
  solverCompetition?: SolverCompetition[]
  totalSolvers?: number
  order?: Order
  debugMode?: boolean
  showCancellationModal: Command | null
  surplusData?: SurplusData
  receiverEnsName?: string
  navigateToNewOrder?: Command
  isProgressBarSetup: boolean
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

const StepComponent: React.FC<{
  status: string
  isFirst: boolean
  step: { title: string; description?: string }
  _index: number
  extraContent?: React.ReactNode
  customColor?: string
}> = ({ status, isFirst, step, _index, extraContent, customColor }) => (
  <styledEl.Step status={status} isFirst={isFirst}>
    <styledEl.NumberedElement status={status} customColor={customColor}>
      {status === 'cancelling' ? (
        <Lottie
          animationData={LOTTIE_RED_CROSS}
          loop={true}
          autoplay={true}
          style={{ width: '24px', height: '24px' }}
        />
      ) : (
        <>
          {_index + 1}
          {status === 'active' && <styledEl.Spinner />}
        </>
      )}
    </styledEl.NumberedElement>
    <styledEl.Content>
      <styledEl.Title customColor={customColor}>{step.title}</styledEl.Title>
      {extraContent}
    </styledEl.Content>
  </styledEl.Step>
)

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

const FINAL_STATES: OrderProgressBarStepName[] = ['expired', 'finished', 'cancelled', 'cancellationFailed']

function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) return `${milliseconds}ms`
  const seconds = milliseconds / 1000
  return `${seconds.toFixed(2)}s` // Format with 2 decimal places
}

const trackLearnMoreClick = (stepName: string) => {
  cowAnalytics.sendEvent({
    category: Category.PROGRESS_BAR,
    action: 'Click Learn More',
    label: stepName,
  })
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
        <styledEl.CircleProgress cx="50" cy="50" r={radius} strokeDasharray={circumference} />
      </styledEl.CircularProgress>
      <styledEl.CountdownText>{countdown}</styledEl.CountdownText>
    </styledEl.CountdownWrapper>
  )
}

interface AnimatedStepTransitionProps {
  currentStep: React.ReactNode
  previousStep: React.ReactNode | null
  direction: 'up' | 'down' | 'none'
}

export function AnimatedStepTransition({ currentStep, previousStep, direction }: AnimatedStepTransitionProps) {
  return (
    <styledEl.TransitionWrapper>
      <styledEl.StepContainer direction={direction}>
        {previousStep}
        {currentStep}
      </styledEl.StepContainer>
    </styledEl.TransitionWrapper>
  )
}

export function OrderProgressBarV2(props: OrderProgressBarV2Props) {
  const { stepName = 'initial', debugMode = IS_DEBUG_MODE } = props
  const [debugStep, setDebugStep] = useState<OrderProgressBarStepName>(stepName)
  const currentStep = debugMode ? debugStep : stepName
  console.log('OrderProgressBarV2 - currentStep:', currentStep)

  const startTimeRef = useRef<number | null>(null)
  const initialStepTriggeredRef = useRef<boolean>(false)
  const getDuration = useCallback(() => {
    if (startTimeRef.current === null) return null
    return Date.now() - startTimeRef.current
  }, [])

  // Separate useEffect for initial step
  useEffect(() => {
    if (currentStep === 'initial' && !initialStepTriggeredRef.current) {
      startTimeRef.current = Date.now()
      initialStepTriggeredRef.current = true
      console.log('Initial step triggered')
      cowAnalytics.sendEvent({
        category: Category.PROGRESS_BAR,
        action: 'Step Triggered',
        label: currentStep,
        value: 0, // This remains 0 for the initial step
      })
    }
  }, [currentStep])

  // useEffect for other steps
  useEffect(() => {
    if (currentStep === 'initial') return // Skip for initial step

    const duration = getDuration()
    const isFinalState = FINAL_STATES.includes(currentStep)

    if (duration !== null) {
      const durationInSeconds = duration / 1000
      const formattedDuration = formatDuration(duration)
      console.log(`Step duration: ${formattedDuration}`)

      cowAnalytics.sendEvent({
        category: Category.PROGRESS_BAR,
        action: 'Step Triggered',
        label: currentStep,
        value: parseFloat(durationInSeconds.toFixed(2)),
      })

      if (isFinalState) {
        cowAnalytics.sendEvent({
          category: Category.PROGRESS_BAR,
          action: 'Order Completed',
          label: currentStep,
          value: parseFloat(durationInSeconds.toFixed(2)),
        })
        console.log(`Final state reached: ${currentStep}. Total duration: ${formattedDuration}`)
        startTimeRef.current = null // Reset the timer for the next order
        initialStepTriggeredRef.current = false // Reset the initial step trigger flag
      }
    }
  }, [currentStep, getDuration])

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
              Your order has been submitted and will be included in the next solver auction. &nbsp;
              <styledEl.Link
                href="https://cow.fi/learn/understanding-batch-auctions"
                target="_blank"
                onClick={() => trackLearnMoreClick('Initial')}
              >
                Learn more ↗
              </styledEl.Link>
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
        <StepComponent
          status="active"
          isFirst={false}
          step={STEPS[1]}
          _index={1}
          extraContent={
            <styledEl.Description>
              The auction has started! Solvers are competing to find the best solution for you...
              <br />
              <styledEl.Link
                href="https://cow.fi/learn/understanding-batch-auctions"
                target="_blank"
                onClick={() => trackLearnMoreClick('Solving')}
              >
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
        <styledEl.ProgressImageWrapper height={'auto'}>
          <Lottie
            animationData={STEP_LOTTIE_EXECUTING}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
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

const COW_SWAP_BENEFITS = [
  'CoW Swap solvers search Uniswap, 1inch, Matcha, Sushi, and more to find you the best price.',
  'CoW Swap sets the standard for protecting against MEV attacks such as frontrunning and sandwiching.',
  "Enjoy intent-based trading with gasless swaps and CoW Swap's unique Coincidences of Wants (CoWs) feature.",
  'Place and cancel limit orders for free on CoW Swap, capturing surplus if the price moves in your favor.',
  'Protect all your Ethereum transactions from MEV by installing MEV Blocker.',
  'Switch to Arbitrum on CoW Swap for quick, cheap transactions with no price impact on large trades.',
  "Liquidity pools on CoW AMM grow faster as they don't lose money to arbitrage bots.",
  "CoW Swap's robust solver competition protects your slippage from being exploited by MEV bots.",
  'Advanced users can create complex, conditional orders directly through CoW Protocol.',
]

function truncateWithEllipsis(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

function getTwitterText(surplusAmount: string, surplusToken: string, orderKind: OrderKind) {
  const actionWord = isSellOrder(orderKind) ? 'got' : 'saved'
  const surplus = `${surplusAmount} ${surplusToken}`
  return encodeURIComponent(
    `Hey, I just ${actionWord} an extra ${surplus} on @CoWSwap! 🐮💸\n\nStart swapping on swap.cow.fi`
  )
}

function getTwitterShareUrl(surplusData: SurplusData | undefined, order: Order | undefined): string {
  const surplusAmount = surplusData?.surplusAmount?.toSignificant() || '0'
  const surplusToken = surplusData?.surplusAmount?.currency.symbol || 'Unknown token'
  const orderKind = order?.kind || OrderKind.SELL

  const twitterText = getTwitterText(surplusAmount, surplusToken, orderKind)
  return `https://x.com/intent/tweet?text=${twitterText}`
}

function shareSurplusOnTwitter(surplusData: SurplusData | undefined, order: Order | undefined) {
  return () => {
    const twitterUrl = getTwitterShareUrl(surplusData, order)
    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
  }
}

function getTwitterTextForBenefit(benefit: string): string {
  return encodeURIComponent(`Did you know? ${benefit}\n\nStart swapping on swap.cow.fi #CoWSwap @CoWSwap 🐮`)
}

function getTwitterShareUrlForBenefit(benefit: string): string {
  const twitterText = getTwitterTextForBenefit(benefit)
  return `https://x.com/intent/tweet?text=${twitterText}`
}

function shareBenefitOnTwitter(benefit: string) {
  return () => {
    const twitterUrl = getTwitterShareUrlForBenefit(benefit)
    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
  }
}

const SURPLUS_IMAGES = [
  PROGRESSBAR_COW_SURPLUS_1,
  PROGRESSBAR_COW_SURPLUS_2,
  PROGRESSBAR_COW_SURPLUS_3,
  PROGRESSBAR_COW_SURPLUS_4,
]

function FinishedStep({
  stepName,
  solverCompetition: solvers,
  totalSolvers,
  order,
  surplusData,
  chainId,
  receiverEnsName,
}: OrderProgressBarV2Props) {
  const [showAllSolvers, setShowAllSolvers] = useState(false)

  const { randomImage, randomBenefit } = useMemo(
    () => ({
      randomImage: SURPLUS_IMAGES[getRandomInt(0, SURPLUS_IMAGES.length - 1)],
      randomBenefit: COW_SWAP_BENEFITS[getRandomInt(0, COW_SWAP_BENEFITS.length - 1)],
    }),
    []
  )

  const { surplusFiatValue, surplusPercent, surplusAmount, showSurplus } = surplusData || {}
  const cancellationFailed = stepName === 'cancellationFailed'
  console.log('FinishedStep - cancellationFailed:', cancellationFailed)
  console.log('FinishedStep - showSurplus:', showSurplus)

  const shouldShowSurplus = DEBUG_FORCE_SHOW_SURPLUS || showSurplus

  const toggleSolvers = () => {
    setShowAllSolvers(!showAllSolvers)
    cowAnalytics.sendEvent({
      category: Category.PROGRESS_BAR,
      action: 'Click Toggle Solvers',
      label: showAllSolvers ? 'Collapse' : 'View More',
    })
  }

  const visibleSolvers = (showAllSolvers ? solvers : solvers?.slice(0, 3)) || []
  const isSell = order && isSellOrder(order.kind)
  const isCustomRecipient = order && getIsCustomRecipient(order)
  const receiver = order?.receiver || order?.owner

  const isDarkMode = useIsDarkMode()

  const surplusPercentValue = surplusPercent ? parseFloat(surplusPercent).toFixed(2) : 'N/A'

  const shareOnTwitter = shouldShowSurplus
    ? shareSurplusOnTwitter(surplusData, order)
    : shareBenefitOnTwitter(randomBenefit)

  const trackShareClick = () => {
    cowAnalytics.sendEvent({
      category: Category.PROGRESS_BAR,
      action: 'Click Share Button',
      label: shouldShowSurplus ? 'Surplus' : 'Benefit',
    })
  }

  // Early return if order is not set
  if (!order) {
    return null
  }

  return (
    <styledEl.FinishedStepContainer>
      {cancellationFailed && (
        <styledEl.CancellationFailedBanner>
          <b>Cancellation failed:</b> The order was executed before it could be cancelled.
        </styledEl.CancellationFailedBanner>
      )}
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper bgColor={'#65D9FF'} padding={'10px'} gap={'10px'}>
          <styledEl.CowImage>
            <styledEl.ShareButton
              onClick={() => {
                shareOnTwitter()
                trackShareClick()
              }}
            >
              <SVG src={ICON_SOCIAL_X} />
              <span>Share this {shouldShowSurplus ? 'win' : 'tip'}!</span>
            </styledEl.ShareButton>
            <SVG src={randomImage} />
          </styledEl.CowImage>
          <styledEl.FinishedImageContent>
            <styledEl.FinishedTagLine>
              {shouldShowSurplus ? (
                <styledEl.BenefitSurplusContainer>
                  I just received surplus on
                  <styledEl.TokenPairTitle title={`${order.inputToken.symbol} / ${order.outputToken.symbol}`}>
                    {truncateWithEllipsis(`${order.inputToken.symbol} / ${order.outputToken.symbol}`, 30)}
                  </styledEl.TokenPairTitle>{' '}
                  <styledEl.Surplus>
                    <Textfit
                      mode="multi"
                      min={14}
                      max={60}
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        lineHeight: 1.2,
                      }}
                    >
                      {shouldShowSurplus && surplusPercentValue !== 'N/A' ? `+${surplusPercentValue}%` : 'N/A'}
                    </Textfit>
                  </styledEl.Surplus>
                </styledEl.BenefitSurplusContainer>
              ) : (
                <styledEl.BenefitSurplusContainer>
                  <styledEl.BenefitTagLine>Did you know?</styledEl.BenefitTagLine>
                  <styledEl.BenefitText>
                    <Textfit
                      mode="multi"
                      min={12}
                      max={50}
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        lineHeight: 1.2,
                      }}
                    >
                      {randomBenefit}
                    </Textfit>
                  </styledEl.BenefitText>
                </styledEl.BenefitSurplusContainer>
              )}
            </styledEl.FinishedTagLine>

            <styledEl.FinishedLogo>
              <ProductLogo
                variant={ProductVariant.CowSwap}
                theme="light"
                overrideColor={UI.COLOR_PRIMARY_DARKER}
                height={19}
                logoIconOnly
              />
              <b>CoW Swap</b>
            </styledEl.FinishedLogo>
          </styledEl.FinishedImageContent>
        </styledEl.ProgressImageWrapper>
      </styledEl.ProgressTopSection>

      <styledEl.ConclusionContent>
        <styledEl.TransactionStatus flexFlow="column" margin={'0 auto 24px'}>
          <Lottie
            animationData={isDarkMode ? LOTTIE_GREEN_CHECKMARK_DARK : LOTTIE_GREEN_CHECKMARK}
            loop={false}
            autoplay
            style={{ width: '56px', height: '56px' }}
          />
          Transaction completed!
        </styledEl.TransactionStatus>

        {order?.apiAdditionalInfo?.executedSellAmount && (
          <styledEl.SoldAmount>
            You sold <TokenLogo token={order.inputToken} size={20} />
            <b>
              <TokenAmount
                amount={CurrencyAmount.fromRawAmount(order.inputToken, order.apiAdditionalInfo.executedSellAmount)}
                tokenSymbol={order.inputToken}
              />
            </b>
          </styledEl.SoldAmount>
        )}

        {order?.apiAdditionalInfo?.executedBuyAmount && (
          <styledEl.ReceivedAmount>
            {!isCustomRecipient && 'You received '}
            <TokenLogo token={order.outputToken} size={20} />
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
        {shouldShowSurplus ? (
          <styledEl.ExtraAmount>
            {getSurplusText(isSell, isCustomRecipient)}
            <i>
              +<TokenAmount amount={surplusAmount} tokenSymbol={surplusAmount?.currency} />
            </i>{' '}
            {surplusFiatValue && +surplusFiatValue.toFixed(2) > 0 && <>(~${surplusFiatValue.toFixed(2)})</>}
          </styledEl.ExtraAmount>
        ) : null}

        {solvers?.length && (
          <styledEl.SolverRankings>
            <h3>Solver auction rankings</h3>
            {solvers.length > 1 && (
              <p>
                <b>
                  {solvers.length} out of {totalSolvers} solvers
                </b>{' '}
                submitted a solution
              </p>
            )}

            <styledEl.SolverTable>
              <tbody>
                {visibleSolvers.map((solver, index) => (
                  <styledEl.SolverTableRow key={`${solver.solver}-${index}`} isWinner={index === 0}>
                    {solvers.length > 1 && <styledEl.SolverRank>{index + 1}</styledEl.SolverRank>}
                    <styledEl.SolverTableCell>
                      <styledEl.SolverInfo>
                        <styledEl.SolverLogo>
                          <img
                            src={solver.image || AMM_LOGOS[solver.solver]?.src || AMM_LOGOS.default.src}
                            alt={`${solver.solver} logo`}
                            width="24"
                            height="24"
                          />
                        </styledEl.SolverLogo>
                        <styledEl.SolverName>{solver.displayName || solver.solver}</styledEl.SolverName>
                      </styledEl.SolverInfo>
                    </styledEl.SolverTableCell>
                    <styledEl.SolverTableCell>
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
      </styledEl.ConclusionContent>
    </styledEl.FinishedStepContainer>
  )
}

function getSurplusText(isSell: boolean | undefined, isCustomRecipient: boolean | undefined): string {
  if (isSell) {
    return isCustomRecipient ? 'including an extra ' : 'and got an extra '
  }
  return 'and saved '
}

function NextBatchStep({ solverCompetition, order }: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper height={'auto'}>
          <Lottie
            animationData={STEP_LOTTIE_NEXTBATCH}
            loop={false}
            autoplay
            style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
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
                  The <strong>{solverCompetition[0].displayName}</strong> solver had the best solution for this batch.
                </>
              )}{' '}
              Unfortunately, your order wasn't part of their winning solution, so we're waiting for solvers to find a
              new solution that includes your order for the next batch.&nbsp;
              <styledEl.Link
                href="https://cow.fi/learn/understanding-batch-auctions"
                target="_blank"
                onClick={() => trackLearnMoreClick('NextBatch')}
              >
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

function DelayedStep({ order, showCancellationModal }: OrderProgressBarV2Props) {
  const trackCancelClick = () => {
    cowAnalytics.sendEvent({
      category: Category.PROGRESS_BAR,
      action: 'Click Cancel Order',
      label: 'Delayed Step',
    })
  }

  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper height={'auto'}>
          <styledEl.SweatDrop>
            <SVG src={SWEAT_DROP} />
          </styledEl.SweatDrop>
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
        <StepComponent
          status="active"
          isFirst={false}
          step={{ ...STEPS[1], title: 'Solving: Still searching' }}
          _index={1}
          extraContent={
            <styledEl.Description>
              This is taking longer than expected! There may be a network issue (such as a gas spike) that is preventing
              solvers from picking up your order. The issue should resolve momentarily.{' '}
              {showCancellationModal && (
                <>
                  You can wait or{' '}
                  <styledEl.CancelButton
                    onClick={() => {
                      showCancellationModal && showCancellationModal()
                      trackCancelClick()
                    }}
                  >
                    cancel the order
                  </styledEl.CancelButton>
                  .
                </>
              )}
            </styledEl.Description>
          }
        />
        <StepComponent status="next" isFirst={false} step={STEPS[2]} _index={2} />
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function UnfillableStep({ order, showCancellationModal }: OrderProgressBarV2Props) {
  const trackCancelClick = () => {
    cowAnalytics.sendEvent({
      category: Category.PROGRESS_BAR,
      action: 'Click Cancel Order',
      label: 'Unfillable Step',
    })
  }

  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper bgColor={'#FFDB9C'} padding={'20px 0 0'}>
          <img src={STEP_IMAGE_UNFILLABLE} alt="Order out of market" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
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
                  You can either wait or{' '}
                  <styledEl.CancelButton
                    onClick={() => {
                      showCancellationModal && showCancellationModal()
                      trackCancelClick()
                    }}
                  >
                    cancel the order
                  </styledEl.CancelButton>
                  .
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
        <styledEl.ProgressImageWrapper height={'auto'}>
          <Lottie
            animationData={STEP_LOTTIE_NEXTBATCH}
            loop={false}
            autoplay
            style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
      </styledEl.ProgressTopSection>
      <styledEl.StepsWrapper>
        <StepComponent
          status="active"
          isFirst={false}
          step={{ ...STEPS[1], title: 'Solving: Finding new solution' }}
          _index={1}
          customColor={`var(${UI.COLOR_ALERT_TEXT})`}
          extraContent={
            <styledEl.Description>
              The order could not be settled on-chain. Solvers are competing to find a new solution.
              <br />
              <styledEl.Link
                href="https://cow.fi/learn/understanding-batch-auctions"
                target="_blank"
                onClick={() => trackLearnMoreClick('SubmissionFailed')}
              >
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

function CancellingStep({ order }: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper height={'auto'}>
          <img src={STEP_IMAGE_CANCELLED} alt="Cancelling order" />
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
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper height={'auto'}>
          <img src={STEP_IMAGE_CANCELLED} alt="Cancelling order" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
      </styledEl.ProgressTopSection>
      <styledEl.ConclusionContent>
        <styledEl.TransactionStatus status={'expired'} flexFlow="column" margin={'14px auto 24px'}>
          Your order was cancelled
        </styledEl.TransactionStatus>
      </styledEl.ConclusionContent>

      <styledEl.Description center margin="10px auto 40px">
        Your order was successfully cancelled.
      </styledEl.Description>
    </styledEl.ProgressContainer>
  )
}

function ExpiredStep({ order, navigateToNewOrder }: OrderProgressBarV2Props) {
  const trackNewOrderClick = () => {
    cowAnalytics.sendEvent({
      category: Category.PROGRESS_BAR,
      action: 'Click Place New Order',
      label: 'Expired Step',
    })
  }

  const trackDiscordClick = () => {
    cowAnalytics.sendEvent({
      category: Category.PROGRESS_BAR,
      action: 'Click Discord Link',
      label: 'Expired Step',
    })
  }

  const trackEmailClick = () => {
    cowAnalytics.sendEvent({
      category: Category.PROGRESS_BAR,
      action: 'Click Email Link',
      label: 'Expired Step',
    })
  }

  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper height={'auto'}>
          <styledEl.ClockAnimation>
            <Lottie
              animationData={LOTTIE_TIME_EXPIRED_DARK}
              loop={false}
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
          </styledEl.ClockAnimation>
          <img src={STEP_IMAGE_EXPIRED} alt="Order expired" />
        </styledEl.ProgressImageWrapper>
        <OrderIntent order={order} />
      </styledEl.ProgressTopSection>
      <styledEl.ConclusionContent>
        <styledEl.TransactionStatus status={'expired'} flexFlow="column" margin={'14px auto 24px'}>
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
            <styledEl.Button
              onClick={() => {
                navigateToNewOrder && navigateToNewOrder()
                trackNewOrderClick()
              }}
            >
              place a new order
            </styledEl.Button>
            without worry.
          </p>
        </styledEl.InfoCard>
      </styledEl.CardWrapper>

      <styledEl.Description center margin="10px 0">
        If your orders often expire, consider increasing your slippage or contact us on{' '}
        <styledEl.Link href="https://discord.com/invite/cowprotocol" target="_blank" onClick={trackDiscordClick}>
          Discord
        </styledEl.Link>{' '}
        or send us an email at{' '}
        <styledEl.Link href="mailto:help@cow.fi" target="_blank" onClick={trackEmailClick}>
          help@cow.fi
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
