import { ReactNode, useMemo, lazy, Suspense } from 'react'

import { getRandomInt } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useLingui } from '@lingui/react/macro'
import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { FinishedStepContentSection } from './FinishedStepContentSection'
import { ProgressSkeleton } from './ProgressSkeleton'
import { ProgressTopSection } from './ProgressTopSection'
import { OrderIntent } from './steps/OrderIntent'
import * as styledEl from './styled'

import { OrderProgressBarStepName, SURPLUS_IMAGES } from '../constants'
import { useProgressBarLayout } from '../hooks/useProgressBarLayout'
import { OrderProgressBarProps } from '../types'

interface ProgressContentProps {
  isLayoutReady: boolean
  stepName: OrderProgressBarProps['stepName']
  order: OrderProgressBarProps['order']
  countdown: number
  chainId: SupportedChainId
  randomImage: string
  surplusPercentValue: string
  randomBenefit: string
  shouldShowSurplus: boolean
  auctionValidFrom?: number
  onAuctionRemainingChange?: (remainingSec: number) => void
}

const AnimatePresence = lazy(() => import('framer-motion').then((r) => ({ default: r.AnimatePresence })))
const MotionDiv = lazy(() => import('framer-motion').then((r) => ({ default: r.motion.div })))

export function RenderProgressTopSection({
  stepName,
  order,
  countdown = 0,
  chainId,
  surplusData,
  debugForceShowSurplus = false,
  randomBenefit = '',
  auctionValidFrom,
  onAuctionRemainingChange,
}: Pick<OrderProgressBarProps, 'stepName' | 'order' | 'countdown' | 'chainId' | 'surplusData'> & {
  debugForceShowSurplus?: boolean
  randomBenefit?: string
  auctionValidFrom?: number
  onAuctionRemainingChange?: (remainingSec: number) => void
}): ReactNode {
  const { t } = useLingui()
  const { disablePostTradeTips } = useInjectedWidgetParams()
  const { cssVariables, isLayoutReady } = useProgressBarLayout()
  const hideIntent =
    stepName === OrderProgressBarStepName.FINISHED || stepName === OrderProgressBarStepName.CANCELLATION_FAILED

  const randomImage = useMemo(() => SURPLUS_IMAGES[getRandomInt(0, SURPLUS_IMAGES.length - 1)], [])

  const { surplusPercent, showSurplus } = surplusData || {}
  const shouldShowSurplus = debugForceShowSurplus || Boolean(showSurplus)
  const surplusPercentValue = surplusPercent ? parseFloat(surplusPercent).toFixed(2) : t`N/A`

  const isFinishedStep =
    stepName === OrderProgressBarStepName.FINISHED || stepName === OrderProgressBarStepName.CANCELLATION_FAILED

  const progressContentProps: ProgressContentProps = {
    isLayoutReady,
    stepName,
    order,
    countdown: countdown || 0,
    chainId,
    randomImage,
    surplusPercentValue,
    randomBenefit,
    shouldShowSurplus,
    auctionValidFrom: stepName === OrderProgressBarStepName.INITIAL ? auctionValidFrom : undefined,
    onAuctionRemainingChange,
  }

  return (
    <>
      {isFinishedStep && (!disablePostTradeTips || shouldShowSurplus) && (
        <FinishedStepContentSection style={cssVariables as React.CSSProperties}>
          <ProgressContent {...progressContentProps} />
        </FinishedStepContentSection>
      )}
      {!isFinishedStep && (
        <styledEl.ProgressTopSection style={cssVariables as React.CSSProperties}>
          <ProgressContent {...progressContentProps} />
        </styledEl.ProgressTopSection>
      )}
      {!hideIntent && <OrderIntent order={order} />}
    </>
  )
}

function ProgressContent({
  isLayoutReady,
  stepName,
  order,
  countdown,
  chainId,
  randomImage,
  surplusPercentValue,
  randomBenefit,
  shouldShowSurplus,
  auctionValidFrom,
  onAuctionRemainingChange,
}: ProgressContentProps): ReactNode {
  const skipLayoutGate =
    stepName === OrderProgressBarStepName.FINISHED || stepName === OrderProgressBarStepName.CANCELLATION_FAILED

  const section = stepName ? (
    <ProgressTopSection
      stepName={stepName}
      order={order}
      countdown={countdown}
      chainId={chainId}
      randomImage={randomImage}
      surplusPercentValue={surplusPercentValue}
      randomBenefit={randomBenefit}
      shouldShowSurplus={shouldShowSurplus}
      auctionValidFrom={auctionValidFrom}
      onAuctionRemainingChange={onAuctionRemainingChange}
    />
  ) : null

  if (skipLayoutGate) {
    return section
  }

  if (!isLayoutReady) {
    return <ProgressSkeleton />
  }

  return (
    <Suspense fallback={<ProgressSkeleton />}>
      <AnimatePresence mode="wait">
        <MotionDiv
          key={stepName}
          initial={false}
          animate={{
            opacity: 1,
            width: '100%',
            transition: {
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            },
          }}
          exit={{ opacity: 0, width: '100%' }}
          style={{ width: '100%' }}
        >
          {section}
        </MotionDiv>
      </AnimatePresence>
    </Suspense>
  )
}
