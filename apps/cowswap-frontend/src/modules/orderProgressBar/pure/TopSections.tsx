import { ReactNode } from 'react'

import STEP_IMAGE_CANCELLED from '@cowprotocol/assets/cow-swap/progressbar-step-cancelled.svg'
import STEP_IMAGE_EXPIRED from '@cowprotocol/assets/cow-swap/progressbar-step-expired.svg'
import STEP_IMAGE_SOLVING from '@cowprotocol/assets/cow-swap/progressbar-step-solving.svg'
import STEP_IMAGE_UNFILLABLE from '@cowprotocol/assets/cow-swap/progressbar-step-unfillable.svg'
import STEP_LOTTIE_EXECUTING from '@cowprotocol/assets/lottie/progressbar-step-executing.json'
import STEP_LOTTIE_NEXTBATCH from '@cowprotocol/assets/lottie/progressbar-step-nextbatch.json'
import LOTTIE_TIME_EXPIRED_DARK from '@cowprotocol/assets/lottie/time-expired-dark.json'
import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import { NoSurplus, ShowSurplus } from './BenefitComponents'
import { FullSizeLottie } from './LottieContainer'
import { ProgressImageWrapper } from './ProgressImageWrapper'
import { AnimatedTokens } from './steps/AnimatedToken'
import { CircularCountdown } from './steps/CircularCountdown'
import * as styledEl from './styled'

import { OrderProgressBarProps } from '../types'

interface BaseTopSectionProps {
  stepName: OrderProgressBarProps['stepName']
}

interface InitialTopSectionProps extends BaseTopSectionProps {
  order: OrderProgressBarProps['order']
}

export function InitialTopSection({ stepName, order }: InitialTopSectionProps): ReactNode {
  return (
    <ProgressImageWrapper stepName={stepName}>
      <AnimatedTokens sellToken={order?.inputToken} buyToken={order?.outputToken} />
    </ProgressImageWrapper>
  )
}

export function UnfillableTopSection(): ReactNode {
  return (
    <img
      src={STEP_IMAGE_UNFILLABLE}
      alt="Order out of market"
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  )
}

// delayed, submissionFailed, solved

export function DelayedSolvedSubmissionFailedTopSection(): ReactNode {
  return <FullSizeLottie animationData={STEP_LOTTIE_NEXTBATCH} />
}

interface SolvingTopSectionProps {
  countdown: number
}

export function SolvingTopSection({ countdown }: SolvingTopSectionProps): ReactNode {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SVG
        src={STEP_IMAGE_SOLVING}
        style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
      />
      <CircularCountdown countdown={countdown || 0} isDelayed={countdown === 0} />
    </div>
  )
}

export function ExecutingTopSection({ stepName }: BaseTopSectionProps): ReactNode {
  return (
    <ProgressImageWrapper stepName={stepName}>
      <FullSizeLottie animationData={STEP_LOTTIE_EXECUTING} />
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
}: FinishedCancellationFailedTopSectionProps): ReactNode {
  return (
    <ProgressImageWrapper stepName={stepName}>
      <styledEl.CowImage>
        <SVG src={randomImage} />
      </styledEl.CowImage>
      <styledEl.FinishedImageContent>
        <styledEl.FinishedTagLine>
          {shouldShowSurplus ? (
            <ShowSurplus
              order={order}
              shouldShowSurplus={shouldShowSurplus}
              surplusPercentValue={surplusPercentValue}
            />
          ) : (
            <NoSurplus randomBenefit={randomBenefit} />
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
    </ProgressImageWrapper>
  )
}

export function CancelledCancellingTopSection({ stepName }: BaseTopSectionProps): ReactNode {
  return (
    <ProgressImageWrapper stepName={stepName}>
      <img
        src={STEP_IMAGE_CANCELLED}
        alt="Cancelling order"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </ProgressImageWrapper>
  )
}

export function ExpiredTopSection({ stepName }: BaseTopSectionProps): ReactNode {
  return (
    <ProgressImageWrapper stepName={stepName}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={STEP_IMAGE_EXPIRED}
          alt="Order expired"
          style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
        <styledEl.ClockAnimation>
          <FullSizeLottie animationData={LOTTIE_TIME_EXPIRED_DARK} loop={false} />
        </styledEl.ClockAnimation>
      </div>
    </ProgressImageWrapper>
  )
}
