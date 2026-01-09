import { ReactNode, useMemo, lazy, Suspense } from 'react'

import { getRandomInt } from '@cowprotocol/common-utils'

import { useLingui } from '@lingui/react/macro'

import { FinishedStepContentSection } from './FinishedStepContentSection'
import { ProgressSkeleton } from './ProgressSkeleton'
import { ProgressTopSection } from './ProgressTopSection'
import { OrderIntent } from './steps/OrderIntent'
import * as styledEl from './styled'

import { CHAIN_SPECIFIC_BENEFITS, SURPLUS_IMAGES } from '../constants'
import { OrderProgressBarStepName } from '../constants'
import { useProgressBarLayout } from '../hooks/useProgressBarLayout'
import { OrderProgressBarProps } from '../types'

interface ProgressContentProps {
  isLayoutReady: boolean
  stepName: OrderProgressBarProps['stepName']
  order: OrderProgressBarProps['order']
  countdown: number
  randomImage: string
  surplusPercentValue: string
  randomBenefit: string
  shouldShowSurplus: boolean
}

const AnimatePresence = lazy(() => import('framer-motion').then((r) => ({ default: r.AnimatePresence })))
const MotionDiv = lazy(() => import('framer-motion').then((r) => ({ default: r.motion.div })))

function ProgressContent({
  isLayoutReady,
  stepName,
  order,
  countdown,
  randomImage,
  surplusPercentValue,
  randomBenefit,
  shouldShowSurplus,
}: ProgressContentProps): ReactNode {
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
          {stepName && (
            <ProgressTopSection
              stepName={stepName}
              order={order}
              countdown={countdown}
              randomImage={randomImage}
              surplusPercentValue={surplusPercentValue}
              randomBenefit={randomBenefit}
              shouldShowSurplus={shouldShowSurplus}
            />
          )}
        </MotionDiv>
      </AnimatePresence>
    </Suspense>
  )
}

export function RenderProgressTopSection({
  stepName,
  order,
  countdown = 0,
  chainId,
  surplusData,
  debugForceShowSurplus = false,
}: Pick<OrderProgressBarProps, 'stepName' | 'order' | 'countdown' | 'chainId' | 'surplusData'> & {
  debugForceShowSurplus?: boolean
}): ReactNode {
  const { t } = useLingui()
  const { cssVariables, isLayoutReady } = useProgressBarLayout()
  const hideIntent =
    stepName === OrderProgressBarStepName.FINISHED || stepName === OrderProgressBarStepName.CANCELLATION_FAILED

  const { randomImage, randomBenefit } = useMemo(() => {
    const benefits = CHAIN_SPECIFIC_BENEFITS[chainId]

    return {
      randomImage: SURPLUS_IMAGES[getRandomInt(0, SURPLUS_IMAGES.length - 1)],
      randomBenefit: t(benefits[getRandomInt(0, benefits.length - 1)]),
    }
  }, [chainId, t])

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
    randomImage,
    surplusPercentValue,
    randomBenefit,
    shouldShowSurplus,
  }

  return (
    <>
      {isFinishedStep ? (
        <FinishedStepContentSection style={cssVariables as React.CSSProperties}>
          <ProgressContent {...progressContentProps} />
        </FinishedStepContentSection>
      ) : (
        <styledEl.ProgressTopSection style={cssVariables as React.CSSProperties}>
          <ProgressContent {...progressContentProps} />
        </styledEl.ProgressTopSection>
      )}
      {!hideIntent && <OrderIntent order={order} />}
    </>
  )
}
