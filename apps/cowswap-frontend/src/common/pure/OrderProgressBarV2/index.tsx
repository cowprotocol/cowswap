import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
import ICON_SOCIAL_X from '@cowprotocol/assets/images/icon-social-x.svg'
import LOTTIE_GREEN_CHECKMARK_DARK from '@cowprotocol/assets/lottie/green-checkmark-dark.json'
import LOTTIE_GREEN_CHECKMARK from '@cowprotocol/assets/lottie/green-checkmark.json'
import STEP_LOTTIE_EXECUTING from '@cowprotocol/assets/lottie/progressbar-step-executing.json'
import STEP_LOTTIE_NEXTBATCH from '@cowprotocol/assets/lottie/progressbar-step-nextbatch.json'
import LOTTIE_RED_CROSS from '@cowprotocol/assets/lottie/red-cross.json'
import LOTTIE_TIME_EXPIRED_DARK from '@cowprotocol/assets/lottie/time-expired-dark.json'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink, getRandomInt, isSellOrder, shortenAddress } from '@cowprotocol/common-utils'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { Confetti, ExternalLink, InfoTooltip, ProductLogo, ProductVariant, TokenAmount, UI } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { AnimatePresence, motion } from 'framer-motion'
import Lottie from 'lottie-react'
import { PiCaretDown, PiCaretUp, PiTrophyFill } from 'react-icons/pi'
import SVG from 'react-inlinesvg'
import { Textfit } from 'react-textfit'

import { AMM_LOGOS } from 'legacy/components/AMMsLogo'
import { Order } from 'legacy/state/orders/actions'
import { useIsDarkMode } from 'legacy/state/user/hooks'

import { Category, cowAnalytics } from 'modules/analytics'

import {
  OrderProgressBarStepName,
  PROGRESS_BAR_TIMER_DURATION,
  SolverCompetition,
} from 'common/hooks/orderProgressBarV2'
import { SurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { getIsCustomRecipient } from 'utils/orderUtils/getIsCustomRecipient'

import * as styledEl from './styled'

const IS_DEBUG_MODE = false
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
    title: 'Batching orders',
  },
  {
    title: 'The competition has started',
  },
  { title: 'Executing', description: 'The winner of the competition is now executing your order on-chain.' },
  { title: 'Transaction completed' },
]

function StepsWrapper({
  steps,
  currentStep,
  extraContent,
  customStepTitles,
  customColor,
  isCancelling,
  isUnfillable,
}: {
  steps: typeof STEPS
  currentStep: number
  extraContent?: React.ReactNode
  customStepTitles?: { [key: number]: string }
  customColor?: string
  isCancelling?: boolean
  isUnfillable?: boolean
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(0)

  useEffect(() => {
    if (wrapperRef.current) {
      const stepElements = Array.from(wrapperRef.current.children)
      const activeStepHeight = stepElements[currentStep]?.clientHeight || 0
      const nextStepHeight = stepElements[currentStep + 1]?.clientHeight || 0
      const totalHeight = activeStepHeight + nextStepHeight

      setContainerHeight(totalHeight)

      const offsetY = stepElements.slice(0, currentStep).reduce((acc, el) => acc + el.clientHeight, 0)
      wrapperRef.current.style.transform = `translateY(-${offsetY}px)`
    }
  }, [currentStep, steps.length])

  return (
    <styledEl.StepsContainer
      $height={containerHeight}
      $minHeight={isCancelling ? '80px' : undefined}
      bottomGradient={!isCancelling}
    >
      <styledEl.StepsWrapper ref={wrapperRef}>
        {steps.map((step, index) => {
          const customTitle = customStepTitles && customStepTitles[index]
          const status =
            index === currentStep
              ? isCancelling
                ? 'cancelling'
                : 'active'
              : index === currentStep + 1
                ? 'next'
                : index < currentStep
                  ? 'done'
                  : 'future'
          return (
            <div key={index}>
              <StepComponent
                status={status}
                isFirst={index === 0}
                step={{ ...step, title: customTitle || step.title }}
                _index={index}
                extraContent={index === currentStep ? extraContent : step.description}
                customColor={index === currentStep ? customColor : undefined}
                isUnfillable={isUnfillable && index === currentStep}
                isCancelling={isCancelling}
              />
            </div>
          )
        })}
      </styledEl.StepsWrapper>
    </styledEl.StepsContainer>
  )
}

function StepComponent({
  status,
  isFirst,
  step,
  _index,
  extraContent,
  customColor,
  isUnfillable,
  isCancelling,
}: {
  status: string
  isFirst: boolean
  step: { title: string }
  _index: number
  extraContent?: React.ReactNode
  customColor?: string
  isUnfillable?: boolean
  isCancelling?: boolean
}) {
  return (
    <styledEl.Step status={status} isFirst={isFirst}>
      <styledEl.NumberedElement
        status={status}
        customColor={customColor}
        $isUnfillable={isUnfillable}
        $isCancelling={isCancelling}
      >
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
            {status === 'active' && !isUnfillable && <styledEl.Spinner />}
          </>
        )}
      </styledEl.NumberedElement>
      <styledEl.Content>
        <styledEl.Title customColor={customColor}>{step.title}</styledEl.Title>
        {status !== 'next' && extraContent && <styledEl.Description>{extraContent}</styledEl.Description>}
      </styledEl.Content>
    </styledEl.Step>
  )
}

function OrderIntent({ order }: { order?: Order }) {
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

function CircularCountdown({ countdown }: CircularCountdownProps) {
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
          startAt={countdown}
          end={PROGRESS_BAR_TIMER_DURATION}
        />
      </styledEl.CircularProgress>
      <styledEl.CountdownText>{countdown}</styledEl.CountdownText>
    </styledEl.CountdownWrapper>
  )
}

export function OrderProgressBarV2(props: OrderProgressBarV2Props) {
  const { stepName = 'initial', debugMode = IS_DEBUG_MODE } = props
  const [debugStep, setDebugStep] = useState<OrderProgressBarStepName>(stepName)
  const currentStep = debugMode ? debugStep : stepName

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
        startTimeRef.current = null // Reset the timer for the next order
        initialStepTriggeredRef.current = false // Reset the initial step trigger flag
      }
    }
  }, [currentStep, getDuration])

  // Ensure StepComponent will be a valid React component or null
  let StepComponent: React.ComponentType<OrderProgressBarV2Props> | null

  if (currentStep === 'cancellationFailed' || currentStep === 'finished') {
    StepComponent = FinishedStep
  } else {
    StepComponent = STEP_NAME_TO_STEP_COMPONENT[currentStep as keyof typeof STEP_NAME_TO_STEP_COMPONENT] || null
  }

  // Always return a value from the function
  return StepComponent ? (
    <>
      <StepComponent {...props} stepName={currentStep} />
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
  ) : null // Fallback return value if StepComponent is not found
}

function AnimatedTokens({
  sellToken,
  buyToken,
}: {
  sellToken: Currency | TokenWithLogo | null | undefined
  buyToken: Currency | TokenWithLogo | null | undefined
}): JSX.Element {
  const ICON_SIZE = 136
  const MOBILE_ICON_SIZE = 72

  return (
    <styledEl.AnimatedTokensWrapper>
      <styledEl.TokenWrapper position="left" size={ICON_SIZE} sizeMobile={MOBILE_ICON_SIZE}>
        <TokenLogo token={sellToken} size={ICON_SIZE} sizeMobile={MOBILE_ICON_SIZE} />
      </styledEl.TokenWrapper>
      <styledEl.TokenWrapper position="center" size={ICON_SIZE} sizeMobile={MOBILE_ICON_SIZE}>
        <TokenLogo token={buyToken} size={ICON_SIZE} sizeMobile={MOBILE_ICON_SIZE} />
      </styledEl.TokenWrapper>
      <styledEl.TokenWrapper position="right" bgColor={'#012F7A'} size={ICON_SIZE} sizeMobile={MOBILE_ICON_SIZE}>
        <ProductLogo
          variant={ProductVariant.CowSwap}
          theme={'dark'}
          overrideHoverColor={'#65D9FF'}
          height={58}
          heightMobile={32}
          logoIconOnly
        />
      </styledEl.TokenWrapper>
    </styledEl.AnimatedTokensWrapper>
  )
}

function RenderProgressTopSection({
  stepName,
  order,
  countdown,
  chainId,
  surplusData,
}: Pick<OrderProgressBarV2Props, 'stepName' | 'order' | 'countdown' | 'chainId' | 'surplusData'>) {
  const hideIntent = stepName === 'finished' || stepName === 'cancellationFailed'

  const { randomImage, randomBenefit } = useMemo(() => {
    const benefits = CHAIN_SPECIFIC_BENEFITS[chainId]

    return {
      randomImage: SURPLUS_IMAGES[getRandomInt(0, SURPLUS_IMAGES.length - 1)],
      randomBenefit: benefits[getRandomInt(0, benefits.length - 1)],
    }
  }, [chainId])

  const { surplusPercent, showSurplus } = surplusData || {}
  const shouldShowSurplus = DEBUG_FORCE_SHOW_SURPLUS || showSurplus
  const surplusPercentValue = surplusPercent ? parseFloat(surplusPercent).toFixed(2) : 'N/A'

  const content = useMemo(() => {
    switch (stepName) {
      case 'initial':
        return (
          <>
            <styledEl.ProgressImageWrapper bgColor={'#65D9FF'} padding={'24px'}>
              <AnimatedTokens sellToken={order?.inputToken} buyToken={order?.outputToken} />
            </styledEl.ProgressImageWrapper>
          </>
        )
      case 'solving':
      case 'solved':
      case 'unfillable':
      case 'delayed':
      case 'submissionFailed':
        return (
          <styledEl.ProgressImageWrapper
            bgColor={
              stepName === 'unfillable'
                ? '#FFDB9C'
                : stepName === 'delayed' || stepName === 'submissionFailed' || stepName === 'solved'
                  ? '#FFB3B3'
                  : '#65D9FF'
            }
            padding={stepName === 'unfillable' ? '20px 0 0' : stepName === 'solving' ? '16px' : '0'}
            height={
              stepName === 'delayed' || stepName === 'submissionFailed' || stepName === 'solved' ? '229px' : 'auto'
            }
          >
            {stepName === 'unfillable' ? (
              <img src={STEP_IMAGE_UNFILLABLE} alt="Order out of market" />
            ) : stepName === 'delayed' || stepName === 'submissionFailed' || stepName === 'solved' ? (
              <Lottie
                animationData={STEP_LOTTIE_NEXTBATCH}
                loop={true}
                autoplay={true}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <>
                <SVG src={STEP_IMAGE_SOLVING} />
                {stepName === 'solving' && <CircularCountdown countdown={countdown || 0} />}
              </>
            )}
          </styledEl.ProgressImageWrapper>
        )
      case 'executing':
        return (
          <styledEl.ProgressImageWrapper height={'auto'}>
            <Lottie
              animationData={STEP_LOTTIE_EXECUTING}
              loop={true}
              autoplay={true}
              style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            />
          </styledEl.ProgressImageWrapper>
        )
      case 'finished':
      case 'cancellationFailed':
        return (
          <styledEl.ProgressTopSection>
            <styledEl.ProgressImageWrapper bgColor={'#65D9FF'} padding={'10px'} gap={'10px'}>
              <styledEl.CowImage>
                <SVG src={randomImage} />
              </styledEl.CowImage>
              <styledEl.FinishedImageContent>
                <styledEl.FinishedTagLine>
                  {shouldShowSurplus ? (
                    <styledEl.BenefitSurplusContainer>
                      I just received surplus on
                      <styledEl.TokenPairTitle title={`${order?.inputToken.symbol} / ${order?.outputToken.symbol}`}>
                        {truncateWithEllipsis(`${order?.inputToken.symbol} / ${order?.outputToken.symbol}`, 30)}
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
        )
      case 'cancelling':
      case 'cancelled':
        return (
          <styledEl.ProgressImageWrapper height={'auto'}>
            <img src={STEP_IMAGE_CANCELLED} alt="Cancelling order" />
          </styledEl.ProgressImageWrapper>
        )
      case 'expired':
        return (
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
        )
      default:
        return null
    }
  }, [stepName, order, countdown, randomImage, randomBenefit, shouldShowSurplus, surplusPercentValue])

  return (
    <styledEl.ProgressTopSection>
      <AnimatePresence mode="wait">
        <motion.div
          key="solving-group"
          initial={false}
          animate={{
            opacity: 1,
            width: '100%',
            transition: {
              duration: 0.15,
              ease: 'easeOut',
            },
          }}
          exit={{ opacity: 0, width: '100%' }}
          style={{ width: '100%' }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
      {!hideIntent && <OrderIntent order={order} />}
    </styledEl.ProgressTopSection>
  )
}

function InitialStep(props: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <RenderProgressTopSection {...props} />
      <StepsWrapper
        steps={STEPS}
        currentStep={0}
        extraContent={
          <styledEl.Description>
            On CoW Swap, orders placed at the same time are{' '}
            <styledEl.Link
              href="https://cow.fi/learn/understanding-batch-auctions"
              target="_blank"
              onClick={() => trackLearnMoreClick('Initial')}
            >
              batched together
            </styledEl.Link>{' '}
            to save on costs!
          </styledEl.Description>
        }
      />
    </styledEl.ProgressContainer>
  )
}

function ExecutingStep(props: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <RenderProgressTopSection {...props} />
      <StepsWrapper
        steps={STEPS}
        currentStep={2}
        customStepTitles={{ 2: 'Best price found!' }}
        extraContent={
          <styledEl.Description>
            The winner of the competition is now executing your order on-chain.
          </styledEl.Description>
        }
      />
    </styledEl.ProgressContainer>
  )
}

const COW_SWAP_BENEFITS = [
  'CoW Swap solvers search Uniswap, 1inch, Matcha, Sushi and more to find you the best price.',
  'CoW Swap sets the standard for protecting against MEV attacks such as frontrunning and sandwiching.',
  'CoW Swap was the first DEX to offer intent-based trading, gasless swaps, coincidences of wants, and many other DeFi innovations.',
  'CoW Swap is the only exchange that matches Coincidences of Wants (CoWs): peer-to-peer swaps that save on settlement costs.',
  'You can avoid price impact on large trades by using TWAP orders on CoW Swap.',
  "Limit orders on CoW Swap capture surplus - so if the price moves in your favor, you're likely to get more than you asked for.",
  "On CoW Swap, you can set limit orders for balances you don't have yet.",
  "Limit orders on CoW Swap are free to place and cancel. That's unique in DeFi!",
  'You can protect all your Ethereum transactions from MEV - not just trades on CoW Swap - by installing MEV Blocker.',
  "Liquidity pools on CoW AMM grow faster than on other AMMs because they don't lose money to arbitrage bots.",
  'CoW Swap has over 20 active solvers - more than any other exchange.',
  "CoW Swap's robust solver competition protects your slippage from being exploited by MEV bots.",
  'Advanced users can create complex, conditional orders directly through CoW Protocol. Read the docs for more info.',
  "Unlike most other exchanges, CoW Swap doesn't charge you any fees if your trade fails.",
]

const TRADE_ON_NEW_CHAINS_BENEFIT =
  'CoW Swap is now live on Arbitrum and Base. Switch the network toggle in the nav bar for quick, cheap transactions.'

const CHAIN_SPECIFIC_BENEFITS: Record<SupportedChainId, string[]> = {
  [SupportedChainId.MAINNET]: [TRADE_ON_NEW_CHAINS_BENEFIT, ...COW_SWAP_BENEFITS],
  [SupportedChainId.ARBITRUM_ONE]: COW_SWAP_BENEFITS,
  [SupportedChainId.BASE]: COW_SWAP_BENEFITS,
  [SupportedChainId.GNOSIS_CHAIN]: [TRADE_ON_NEW_CHAINS_BENEFIT, ...COW_SWAP_BENEFITS],
  [SupportedChainId.SEPOLIA]: [TRADE_ON_NEW_CHAINS_BENEFIT, ...COW_SWAP_BENEFITS],
}

function truncateWithEllipsis(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

function getTwitterText(surplusAmount: string, surplusToken: string, orderKind: OrderKind) {
  const actionWord = isSellOrder(orderKind) ? 'got' : 'saved'
  const surplus = `${surplusAmount} ${surplusToken}`
  return encodeURIComponent(
    `Hey, I just ${actionWord} an extra ${surplus} on @CoWSwap! 🐮💸\n\nStart swapping on swap.cow.fi`,
  )
}

function getTwitterShareUrl(surplusData: SurplusData | undefined, order: Order | undefined): string {
  const surplusAmount = surplusData?.surplusAmount?.toSignificant() || '0'
  const surplusToken = surplusData?.surplusAmount?.currency.symbol || 'Unknown token'
  const orderKind = order?.kind || OrderKind.SELL

  const twitterText = getTwitterText(surplusAmount, surplusToken, orderKind)
  return `https://x.com/intent/tweet?text=${twitterText}`
}

function getTwitterTextForBenefit(benefit: string): string {
  return encodeURIComponent(`Did you know? ${benefit}\n\nStart swapping on swap.cow.fi #CoWSwap @CoWSwap 🐮`)
}

function getTwitterShareUrlForBenefit(benefit: string): string {
  const twitterText = getTwitterTextForBenefit(benefit)
  return `https://x.com/intent/tweet?text=${twitterText}`
}

const SURPLUS_IMAGES = [
  PROGRESSBAR_COW_SURPLUS_1,
  PROGRESSBAR_COW_SURPLUS_2,
  PROGRESSBAR_COW_SURPLUS_3,
  PROGRESSBAR_COW_SURPLUS_4,
]

function FinishedStep(props: OrderProgressBarV2Props) {
  const { stepName, solverCompetition: solvers, totalSolvers, order, surplusData, chainId, receiverEnsName } = props
  const [showAllSolvers, setShowAllSolvers] = useState(false)
  const cancellationFailed = stepName === 'cancellationFailed'

  const { surplusFiatValue, surplusAmount, showSurplus } = surplusData || {}
  const shouldShowSurplus = DEBUG_FORCE_SHOW_SURPLUS || showSurplus

  const [showConfetti, setShowConfetti] = useState(stepName === 'finished' && shouldShowSurplus)

  const visibleSolvers = useMemo(() => {
    return showAllSolvers ? solvers : solvers?.slice(0, 3)
  }, [showAllSolvers, solvers])

  const toggleSolvers = useCallback(() => {
    setShowAllSolvers((prev) => !prev)
    cowAnalytics.sendEvent({
      category: Category.PROGRESS_BAR,
      action: 'Click Toggle Solvers',
      label: showAllSolvers ? 'Collapse' : 'View More',
    })
  }, [showAllSolvers])

  const isSell = order && isSellOrder(order.kind)
  const isCustomRecipient = order && getIsCustomRecipient(order)
  const receiver = order?.receiver || order?.owner

  const isDarkMode = useIsDarkMode()

  const { randomBenefit } = useMemo(() => {
    const benefits = CHAIN_SPECIFIC_BENEFITS[chainId]

    return {
      randomImage: SURPLUS_IMAGES[getRandomInt(0, SURPLUS_IMAGES.length - 1)],
      randomBenefit: benefits[getRandomInt(0, benefits.length - 1)],
    }
  }, [chainId])

  const shareOnTwitter = useCallback(() => {
    const twitterUrl = shouldShowSurplus
      ? getTwitterShareUrl(surplusData, order)
      : getTwitterShareUrlForBenefit(randomBenefit)
    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
  }, [shouldShowSurplus, surplusData, order, randomBenefit])

  const trackShareClick = useCallback(() => {
    cowAnalytics.sendEvent({
      category: Category.PROGRESS_BAR,
      action: 'Click Share Button',
      label: shouldShowSurplus ? 'Surplus' : 'Benefit',
    })
  }, [shouldShowSurplus])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined

    if (stepName === 'finished' && shouldShowSurplus) {
      setShowConfetti(true)
      timer = setTimeout(() => setShowConfetti(false), 3000)
    }

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [stepName, shouldShowSurplus])

  // If order is not set, return null
  if (!order) {
    return null
  }

  return (
    <styledEl.FinishedStepContainer>
      {showConfetti && <Confetti start={true} />}
      {cancellationFailed && (
        <styledEl.CancellationFailedBanner>
          <b>Cancellation failed:</b> The order was executed before it could be cancelled.
        </styledEl.CancellationFailedBanner>
      )}

      <styledEl.ConclusionContent>
        <styledEl.TransactionStatus margin={'0 auto 24px'}>
          <Lottie
            animationData={isDarkMode ? LOTTIE_GREEN_CHECKMARK_DARK : LOTTIE_GREEN_CHECKMARK}
            loop={false}
            autoplay
            style={{ width: '36px', height: '36px' }}
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

        {solvers && solvers.length > 0 && (
          <styledEl.SolverRankings>
            <h3>Solver auction rankings</h3>
            {solvers.length > 1 && (
              <p>
                <b>
                  {solvers.length}
                  {totalSolvers ? ` out of ${totalSolvers}` : ''} solvers
                </b>{' '}
                submitted a solution
              </p>
            )}

            <styledEl.SolverTable>
              <tbody>
                {visibleSolvers?.map((solver, index) => (
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
                        <styledEl.SolverName>
                          {solver.displayName || solver.solver}
                          {solver.description && (
                            <span>
                              <InfoTooltip content={solver.description} />
                            </span>
                          )}
                        </styledEl.SolverName>
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

      <RenderProgressTopSection {...props} />
      <styledEl.ShareButton
        onClick={() => {
          shareOnTwitter()
          trackShareClick()
        }}
      >
        <SVG src={ICON_SOCIAL_X} />
        <span>Share this {shouldShowSurplus ? 'win' : 'tip'}!</span>
      </styledEl.ShareButton>
    </styledEl.FinishedStepContainer>
  )
}

function getSurplusText(isSell: boolean | undefined, isCustomRecipient: boolean | undefined): string {
  if (isSell) {
    return isCustomRecipient ? 'including an extra ' : 'and got an extra '
  }
  return 'and saved '
}

function SolvingStep(props: OrderProgressBarV2Props) {
  const { countdown, stepName, showCancellationModal } = props
  const isUnfillable = stepName === 'unfillable'
  const isDelayed = stepName === 'delayed'
  const isSubmissionFailed = stepName === 'submissionFailed'
  const isSolved = stepName === 'solved'

  const trackCancelClick = () => {
    cowAnalytics.sendEvent({
      category: Category.PROGRESS_BAR,
      action: 'Click Cancel Order',
      label: isUnfillable ? 'Unfillable Step' : isDelayed ? 'Delayed Step' : isSolved ? 'Solved Step' : 'Solving Step',
    })
  }

  const trackLearnMoreClick = (label: string) => {
    cowAnalytics.sendEvent({
      category: Category.PROGRESS_BAR,
      action: 'Click Learn More',
      label,
    })
  }

  return (
    <styledEl.ProgressContainer>
      <RenderProgressTopSection
        {...props}
        countdown={isUnfillable || isDelayed || isSubmissionFailed || isSolved ? undefined : countdown}
      />
      <StepsWrapper
        steps={STEPS}
        currentStep={1}
        customStepTitles={
          isUnfillable
            ? { 1: 'Price change' }
            : isDelayed
              ? { 1: 'Still searching' }
              : isSubmissionFailed
                ? { 1: 'A new competition has started' }
                : isSolved
                  ? { 1: 'A new competition has started' }
                  : undefined
        }
        extraContent={
          <styledEl.Description>
            {isUnfillable ? (
              <>
                Uh oh! The market price has moved outside of your slippage tolerance. You can wait for prices to change
                {showCancellationModal && (
                  <>
                    {' '}
                    or{' '}
                    <styledEl.CancelButton
                      onClick={() => {
                        showCancellationModal && showCancellationModal()
                        trackCancelClick()
                      }}
                    >
                      cancel the order
                    </styledEl.CancelButton>
                  </>
                )}
                .
              </>
            ) : isDelayed ? (
              <>
                There may be a network issue (such as a gas spike) that is delaying your order. You can wait for the
                issue to resolve
                {showCancellationModal && (
                  <>
                    {' '}
                    or{' '}
                    <styledEl.CancelButton
                      onClick={() => {
                        showCancellationModal && showCancellationModal()
                        trackCancelClick()
                      }}
                    >
                      cancel your order
                    </styledEl.CancelButton>
                  </>
                )}
                .
              </>
            ) : isSubmissionFailed ? (
              <>
                Something went wrong. But don't worry!{' '}
                <styledEl.Link
                  href="https://docs.cow.fi/cow-protocol/concepts/introduction/solvers"
                  target="_blank"
                  onClick={() => trackLearnMoreClick('Submission Failed')}
                >
                  CoW Swap solvers
                </styledEl.Link>{' '}
                are searching again for the best price for you.
              </>
            ) : isSolved ? (
              <>
                Something went wrong and your order couldn't be executed with this batch. But don't worry! CoW Swap is
                already holding another competition for your order.
              </>
            ) : (
              <>
                <styledEl.Link
                  href="https://docs.cow.fi/cow-protocol/concepts/introduction/solvers"
                  target="_blank"
                  onClick={() => trackLearnMoreClick('Solving')}
                >
                  CoW Swap solvers
                </styledEl.Link>{' '}
                are scanning liquidity sources across DeFi. The one that finds you the best price wins!
              </>
            )}
          </styledEl.Description>
        }
        customColor={isUnfillable || isDelayed || isSolved || isSubmissionFailed ? '#996815' : undefined}
        isUnfillable={isUnfillable}
      />
    </styledEl.ProgressContainer>
  )
}

function CancellingStep(props: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <RenderProgressTopSection {...props} />
      <StepsWrapper
        steps={[{ title: 'Cancelling' }]}
        currentStep={0}
        extraContent={<styledEl.Description>Your order is being cancelled.</styledEl.Description>}
        customColor={`var(${UI.COLOR_DANGER_TEXT})`}
        isCancelling={true}
      />
    </styledEl.ProgressContainer>
  )
}

function CancelledStep(props: OrderProgressBarV2Props) {
  return (
    <styledEl.ProgressContainer>
      <RenderProgressTopSection {...props} />
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

function ExpiredStep(props: OrderProgressBarV2Props) {
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
      <RenderProgressTopSection {...props} />
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
                props.navigateToNewOrder?.()
                trackNewOrderClick()
              }}
            >
              place a new order
            </styledEl.Button>{' '}
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
  solved: SolvingStep, // Use SolvingStep for 'solved' state
  delayed: SolvingStep,
  unfillable: SolvingStep,
  submissionFailed: SolvingStep,
  cancelling: CancellingStep,
  cancelled: CancelledStep,
  expired: ExpiredStep,
  cancellationFailed: FinishedStep,
}
