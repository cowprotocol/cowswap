import STEP_IMAGE_CANCELLED from '@cowprotocol/assets/cow-swap/progressbar-step-cancelled.svg'
import STEP_IMAGE_EXPIRED from '@cowprotocol/assets/cow-swap/progressbar-step-expired.svg'
import STEP_IMAGE_SOLVING from '@cowprotocol/assets/cow-swap/progressbar-step-solving.svg'
import STEP_IMAGE_UNFILLABLE from '@cowprotocol/assets/cow-swap/progressbar-step-unfillable.svg'
import STEP_LOTTIE_EXECUTING from '@cowprotocol/assets/lottie/progressbar-step-executing.json'
import STEP_LOTTIE_NEXTBATCH from '@cowprotocol/assets/lottie/progressbar-step-nextbatch.json'
import LOTTIE_TIME_EXPIRED_DARK from '@cowprotocol/assets/lottie/time-expired-dark.json'
import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import Lottie from 'lottie-react'
import SVG from 'react-inlinesvg'
import { Textfit } from 'react-textfit'

import { ProgressImageWrapper } from './ProgressImageWrapper'
import * as styledEl from './styled'

import { truncateWithEllipsis } from '../helpers'
import AnimatedTokens from '../steps/AnimatedToken'
import { CircularCountdown } from '../steps/CircularCountdown'
import { OrderProgressBarProps } from '../types'

interface BaseTopSectionProps {
  stepName: OrderProgressBarProps['stepName']
}

interface InitialTopSectionProps extends BaseTopSectionProps {
  order: OrderProgressBarProps['order']
}

export function InitialTopSection({ stepName, order }: InitialTopSectionProps) {
  return (
    <ProgressImageWrapper stepName={stepName}>
      <AnimatedTokens sellToken={order?.inputToken} buyToken={order?.outputToken} />
    </ProgressImageWrapper>
  )
}

export function UnfillableTopSection() {
  return <img src={STEP_IMAGE_UNFILLABLE} alt="Order out of market" />
}

// delayed, submissionFailed, solved
export function DelayedSolvedSubmissionFailedTopSection() {
  return (
    <Lottie
      animationData={STEP_LOTTIE_NEXTBATCH}
      loop={true}
      autoplay={true}
      style={{ width: '100%', height: '100%' }}
    />
  )
}

interface SolvingTopSectionProps {
  countdown: number
}

export function SolvingTopSection({ countdown }: SolvingTopSectionProps) {
  return (
    <>
      <SVG src={STEP_IMAGE_SOLVING} />
      <CircularCountdown countdown={countdown || 0} />
    </>
  )
}

export function ExecutingTopSection({ stepName }: BaseTopSectionProps) {
  return (
    <ProgressImageWrapper stepName={stepName}>
      <Lottie
        animationData={STEP_LOTTIE_EXECUTING}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      />
    </ProgressImageWrapper>
  )
}

interface FinishedCancellationFailedTopSectionProps extends BaseTopSectionProps {
  order: OrderProgressBarProps['order']
  randomImage: string
  shouldShowSurplus?: boolean | null
  surplusPercentValue: string
  randomBenefit: string
}

export function FinishedCancellationFailedTopSection({
  stepName,
  order,
  randomImage,
  shouldShowSurplus,
  surplusPercentValue,
  randomBenefit,
}: FinishedCancellationFailedTopSectionProps) {
  function ShowSurplus() {
    return (
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
    )
  }

  function NoSurplus() {
    return (
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
    )
  }
  return (
    <styledEl.ProgressTopSection>
      <ProgressImageWrapper stepName={stepName}>
        <styledEl.CowImage>
          <SVG src={randomImage} />
        </styledEl.CowImage>
        <styledEl.FinishedImageContent>
          <styledEl.FinishedTagLine>{shouldShowSurplus ? <ShowSurplus /> : <NoSurplus />}</styledEl.FinishedTagLine>
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
      </ProgressImageWrapper>
    </styledEl.ProgressTopSection>
  )
}

export function CancelledCancellingTopSection({ stepName }: BaseTopSectionProps) {
  return (
    <ProgressImageWrapper stepName={stepName}>
      <img src={STEP_IMAGE_CANCELLED} alt="Cancelling order" />
    </ProgressImageWrapper>
  )
}

export function ExpiredTopSection({ stepName }: BaseTopSectionProps) {
  return (
    <ProgressImageWrapper stepName={stepName}>
      <styledEl.ClockAnimation>
        <Lottie
          animationData={LOTTIE_TIME_EXPIRED_DARK}
          loop={false}
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </styledEl.ClockAnimation>
      <img src={STEP_IMAGE_EXPIRED} alt="Order expired" />
    </ProgressImageWrapper>
  )
}
