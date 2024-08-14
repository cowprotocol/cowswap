import React, { useState, useEffect, useRef, useMemo } from 'react'

import PROGRESS_BAR_BAD_NEWS from '@cowprotocol/assets/cow-swap/progressbar-bad-news.svg'
import PROGRESSBAR_COW_SURPLUS_1 from '@cowprotocol/assets/cow-swap/progressbar-finished-image-1.svg'
import PROGRESSBAR_COW_SURPLUS_2 from '@cowprotocol/assets/cow-swap/progressbar-finished-image-2.svg'
import PROGRESSBAR_COW_SURPLUS_3 from '@cowprotocol/assets/cow-swap/progressbar-finished-image-3.svg'
import PROGRESSBAR_COW_SURPLUS_4 from '@cowprotocol/assets/cow-swap/progressbar-finished-image-4.svg'
import PROGRESS_BAR_GOOD_NEWS from '@cowprotocol/assets/cow-swap/progressbar-good-news.svg'
import STEP_IMAGE_EXPIRED from '@cowprotocol/assets/cow-swap/progressbar-step-expired.svg'

import SWEAT_DROP from '@cowprotocol/assets/cow-swap/sweat-drop.svg'
import STEP_IMAGE_UNFILLABLE from '@cowprotocol/assets/cow-swap/progressbar-step-unfillable.svg'
import STEP_IMAGE_CANCELLED from '@cowprotocol/assets/cow-swap/progressbar-step-cancelled.svg'
import ICON_SOCIAL_X from '@cowprotocol/assets/images/icon-social-x.svg'
import LOTTIE_GREEN_CHECKMARK_DARK from '@cowprotocol/assets/lottie/green-checkmark-dark.json'
import LOTTIE_GREEN_CHECKMARK from '@cowprotocol/assets/lottie/green-checkmark.json'
import STEP_LOTTIE_EXECUTING from '@cowprotocol/assets/lottie/progressbar-step-executing.json'
import STEP_LOTTIE_INITIAL from '@cowprotocol/assets/lottie/progressbar-step-initial.json'
import STEP_LOTTIE_NEXTBATCH from '@cowprotocol/assets/lottie/progressbar-step-nextbatch.json'
import STEP_IMAGE_SOLVING_1 from '@cowprotocol/assets/cow-swap/progressbar-step-solving-1.svg'
import STEP_IMAGE_SOLVING_2 from '@cowprotocol/assets/cow-swap/progressbar-step-solving-2.svg'
import STEP_IMAGE_SOLVING_3 from '@cowprotocol/assets/cow-swap/progressbar-step-solving-3.svg'
import LOTTIE_RED_CROSS from '@cowprotocol/assets/lottie/red-cross.json'
import LOTTIE_TIME_EXPIRED_DARK from '@cowprotocol/assets/lottie/time-expired-dark.json'
import { ExplorerDataType, getExplorerLink, isSellOrder, shortenAddress } from '@cowprotocol/common-utils'
import type { CompetitionOrderStatus, SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { ExternalLink, ProductLogo, ProductVariant, TokenAmount, UI } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { shareSurplusOnTwitter as trackSurplusShare } from 'modules/analytics'

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

import { OrderProgressBarStepName } from 'common/hooks/orderProgressBarV2'
import { SurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { useFitText } from '@cowprotocol/common-hooks'
import { getIsCustomRecipient } from 'utils/orderUtils/getIsCustomRecipient'
import { getRandomInt } from '@cowprotocol/common-utils'
import { useIsDarkMode } from 'legacy/state/user/hooks'

import * as styledEl from './styled'

const IS_DEBUG_MODE = false
const DEBUG_FORCE_SHOW_SURPLUS = false

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
  navigateToNewOrder?: Command
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
  const isDarkMode = useIsDarkMode()
  const iconColor = customColor || (status === 'done' ? 'green' : 'inherit')

  switch (status) {
    case 'done':
      return <PiCheckCircleFill color={iconColor} />
    case 'active':
      return (
        <styledEl.SpinnerIcon>
          <PiSpinnerBallFill color={iconColor} />
        </styledEl.SpinnerIcon>
      )
    case 'error':
    case 'unfillable':
      return <MdOutlineMotionPhotosPause color={iconColor} />
    case 'cancelling':
      return (
        <Lottie
          animationData={isDarkMode ? LOTTIE_RED_CROSS : LOTTIE_RED_CROSS}
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

interface CountdownElProps {
  countdown: number
}

const CountdownEl: React.FC<CountdownElProps> = ({ countdown }) => {
  const formattedCountdown = countdown < 10 ? `0${countdown}` : `${countdown}`

  return (
    <styledEl.CountdownWrapper>
      <styledEl.CountdownText>{formattedCountdown}s</styledEl.CountdownText>
    </styledEl.CountdownWrapper>
  )
}

export function OrderProgressBarV2(props: OrderProgressBarV2Props) {
  const { stepName, debugMode = IS_DEBUG_MODE } = props
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
        <styledEl.ProgressImageWrapper bgColor={'#65D9FF'} height={'auto'}>
          <Lottie
            animationData={STEP_LOTTIE_INITIAL}
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
          isFirst={true}
          step={STEPS[0]}
          _index={0}
          extraContent={
            <styledEl.Description>
              Your order has been submitted and will be included in the next solver auction. &nbsp;
              <styledEl.Link href="https://cow.fi/learn/understanding-batch-auctions" target="_blank">
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
        <StepComponent status="future" isFirst={false} step={STEPS[2]} _index={2} />
      </styledEl.StepsWrapper>
    </styledEl.ProgressContainer>
  )
}

function SolvingStep({ order, countdown }: OrderProgressBarV2Props) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const frames = [STEP_IMAGE_SOLVING_1, STEP_IMAGE_SOLVING_2, STEP_IMAGE_SOLVING_3]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prevFrame) => (prevFrame + 1) % frames.length)
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper height={'auto'}>
          <img
            src={frames[currentFrame]}
            alt="Solving animation"
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
          <CountdownEl countdown={countdown || 0} />
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
              <styledEl.Link href="https://cow.fi/learn/understanding-batch-auctions" target="_blank">
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
        <StepComponent status="done" isFirst={false} step={{ ...STEPS[0], title: 'Solved' }} _index={0} />
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
  "Unlike other exchanges, here you don't pay any fees if your trade fails.",
  'COW Swap finds the best prices across multiple liquidity sources for you.',
  "Enjoy MEV protection and no front-running with COW Swap's unique order settlement.",
  "Experience gasless trading with COW Swap's off-chain order matching.",
  "Don't worry, trade happy!",
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
    trackSurplusShare()
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
    // You might want to add analytics tracking for benefit sharing as well
    // trackBenefitShare()
  }
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
  console.log('FinishedStep - showSurplus:', showSurplus)

  // Modify this line to include the debug flag
  const shouldShowSurplus = DEBUG_FORCE_SHOW_SURPLUS || showSurplus

  const toggleSolvers = () => setShowAllSolvers(!showAllSolvers)

  const visibleSolvers = (showAllSolvers ? solvers : solvers?.slice(0, 3)) || []
  const isSell = order && isSellOrder(order.kind)
  const isCustomRecipient = order && getIsCustomRecipient(order)
  const receiver = order?.receiver || order?.owner

  const isDarkMode = useIsDarkMode()

  // Randomly select a benefit message on component initialization
  const randomBenefit = useMemo(() => COW_SWAP_BENEFITS[getRandomInt(0, COW_SWAP_BENEFITS.length - 1)], [])

  const surplusPercentValue = surplusPercent ? parseFloat(surplusPercent).toFixed(2) : 'N/A'
  const { fontSize: surplusFontSize, textRef: surplusTextRef, containerRef: surplusContainerRef } = useFitText(18, 50)
  const { fontSize: benefitFontSize, textRef: benefitTextRef, containerRef: benefitContainerRef } = useFitText(18, 72)

  const [surplusSize, setSurplusSize] = useState(1)
  const surplusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (surplusRef.current) {
      const container = surplusRef.current.parentElement
      if (container) {
        const fitText = () => {
          let fontSize = 1
          surplusRef.current!.style.fontSize = `${fontSize}px`

          while (
            surplusRef.current!.scrollWidth <= container.clientWidth &&
            surplusRef.current!.scrollHeight <= container.clientHeight &&
            fontSize < 50 // Cap at 50px
          ) {
            fontSize += 0.5
            surplusRef.current!.style.fontSize = `${fontSize}px`
          }

          fontSize -= 0.5
          setSurplusSize(Math.min(fontSize, 50)) // Ensure it doesn't exceed 50px
        }

        fitText()
        window.addEventListener('resize', fitText)
        return () => window.removeEventListener('resize', fitText)
      }
    }
    return () => {}
  }, [shouldShowSurplus, surplusPercentValue])

  const shareOnTwitter = shouldShowSurplus
    ? shareSurplusOnTwitter(surplusData, order)
    : shareBenefitOnTwitter(randomBenefit)

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
            <styledEl.ShareButton onClick={shareOnTwitter}>
              <SVG src={ICON_SOCIAL_X} />
              <span>Share this {shouldShowSurplus ? 'win' : 'tip'}!</span>
            </styledEl.ShareButton>
            <SVG
              src={React.useMemo(() => {
                const images = [
                  PROGRESSBAR_COW_SURPLUS_1,
                  PROGRESSBAR_COW_SURPLUS_2,
                  PROGRESSBAR_COW_SURPLUS_3,
                  PROGRESSBAR_COW_SURPLUS_4,
                ]
                return images[Math.floor(Math.random() * images.length)]
              }, [])}
            />
          </styledEl.CowImage>
          <styledEl.FinishedImageContent>
            <styledEl.FinishedTagLine>
              {shouldShowSurplus ? (
                <styledEl.BenefitSurplusContainer ref={surplusContainerRef}>
                  <span ref={surplusTextRef} style={{ fontSize: `${surplusFontSize}px` }}>
                    I just received surplus on my
                    <styledEl.TokenPairTitle title={`${order.inputToken.symbol}/${order.outputToken.symbol}`}>
                      {truncateWithEllipsis(`${order.inputToken.symbol}/${order.outputToken.symbol}`, 30)}
                    </styledEl.TokenPairTitle>{' '}
                    trade
                    <styledEl.Surplus
                      ref={surplusRef}
                      showSurplus={!!shouldShowSurplus}
                      style={{ fontSize: `${surplusSize}px` }}
                      data-content={
                        shouldShowSurplus && surplusPercentValue !== 'N/A' ? `+${surplusPercentValue}%` : 'N/A'
                      }
                    >
                      <span>
                        {shouldShowSurplus && surplusPercentValue !== 'N/A' ? `+${surplusPercentValue}%` : 'N/A'}
                      </span>
                    </styledEl.Surplus>
                  </span>
                </styledEl.BenefitSurplusContainer>
              ) : (
                <styledEl.BenefitSurplusContainer ref={benefitContainerRef}>
                  <styledEl.BenefitText ref={benefitTextRef} fontSize={benefitFontSize}>
                    {randomBenefit}
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
        <styledEl.TransactionStatus flexFlow="column" margin={'0 auto 14px'}>
          <Lottie
            animationData={isDarkMode ? LOTTIE_GREEN_CHECKMARK_DARK : LOTTIE_GREEN_CHECKMARK}
            loop={false}
            autoplay
            style={{ width: '56px', height: '56px' }}
          />
          Transaction completed!
        </styledEl.TransactionStatus>

        {solvers?.length && (
          <styledEl.SolverRankings>
            <h3>Solver auction rankings</h3>
            {solvers.length > 1 && (
              <p>
                <b>{solvers.length} out of 25 solvers</b> submitted a solution
              </p>
            )}

            <styledEl.SolverTable>
              <tbody>
                {visibleSolvers.map((solver: any, index: number) => (
                  <styledEl.SolverTableRow key={`${solver.solver}-${index}`} isWinner={index === 0}>
                    {solvers.length > 1 && <styledEl.SolverRank>{index + 1}</styledEl.SolverRank>}
                    <styledEl.SolverTableCell>
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
        {shouldShowSurplus ? (
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
              new solution that includes your order for the next batch.&nbsp;
              <styledEl.Link href="https://cow.fi/learn/understanding-batch-auctions" target="_blank">
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
  const [currentFrame, setCurrentFrame] = useState(0)
  const frames = [STEP_IMAGE_SOLVING_1, STEP_IMAGE_SOLVING_2, STEP_IMAGE_SOLVING_3]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prevFrame) => (prevFrame + 1) % frames.length)
    }, 150)

    return () => clearInterval(interval)
  }, [])

  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper height={'auto'}>
          <styledEl.SweatDrop>
            <SVG src={SWEAT_DROP} />
          </styledEl.SweatDrop>
          <img
            src={frames[currentFrame]}
            alt="Solving animation"
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
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
              This is taking longer than expected! There may be a network issue (such as a gas spike) that is preventing
              solvers from picking up your order. The issue should resolve momentarily.{' '}
              {showCancellationModal && (
                <>
                  You can wait or{' '}
                  <styledEl.CancelButton onClick={showCancellationModal}>cancel the order</styledEl.CancelButton>.
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
  return (
    <styledEl.ProgressContainer>
      <styledEl.ProgressTopSection>
        <styledEl.ProgressImageWrapper height={'auto'}>
          <img src={STEP_IMAGE_UNFILLABLE} alt="Order out of market" />
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
                  You can either wait or{' '}
                  <styledEl.CancelButton onClick={showCancellationModal}>cancel the order</styledEl.CancelButton>.
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
              <br />
              <styledEl.Link href="https://cow.fi/learn/understanding-batch-auctions" target="_blank">
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
        <styledEl.TransactionStatus flexFlow="column">Your order was cancelled</styledEl.TransactionStatus>
      </styledEl.ConclusionContent>

      <styledEl.Description center margin="10px auto 40px">
        Your order was successfully cancelled.
      </styledEl.Description>
    </styledEl.ProgressContainer>
  )
}

function ExpiredStep({ order, navigateToNewOrder }: OrderProgressBarV2Props) {
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
            <styledEl.Button onClick={navigateToNewOrder}>place a new order</styledEl.Button>
            without worry.
          </p>
        </styledEl.InfoCard>
      </styledEl.CardWrapper>

      <styledEl.Description center margin="10px 0">
        If your orders often expire, consider increasing your slippage or contact us on{' '}
        <styledEl.Link href="https://discord.com/invite/cowprotocol" target="_blank">
          Discord
        </styledEl.Link>{' '}
        or send us an email at{' '}
        <styledEl.Link href="mailto:help@cow.fi" target="_blank">
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
