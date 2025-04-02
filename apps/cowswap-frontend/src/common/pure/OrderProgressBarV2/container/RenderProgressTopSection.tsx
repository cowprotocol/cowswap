import { useMemo } from 'react'

import { getRandomInt } from '@cowprotocol/common-utils'

import { AnimatePresence, motion } from 'framer-motion'

import { ProgressImageWrapper } from './ProgressImageWrapper'
import * as styledEl from './styled'
import {
  CancelledCancellingTopSection,
  DelayedSolvedSubmissionFailedTopSection,
  ExecutingTopSection,
  ExpiredTopSection,
  FinishedCancellationFailedTopSection,
  InitialTopSection,
  SolvingTopSection,
  UnfillableTopSection,
} from './TopSections'

import { CHAIN_SPECIFIC_BENEFITS, SURPLUS_IMAGES } from '../constants'
import { OrderIntent } from '../steps/OrderIntent'
import { OrderProgressBarV2Props } from '../types'

export function RenderProgressTopSection({
  stepName,
  order,
  countdown,
  chainId,
  surplusData,
  debugForceShowSurplus = false,
}: Pick<OrderProgressBarV2Props, 'stepName' | 'order' | 'countdown' | 'chainId' | 'surplusData'> & {
  debugForceShowSurplus?: boolean
}) {
  const hideIntent = stepName === 'finished' || stepName === 'cancellationFailed'

  const { randomImage, randomBenefit } = useMemo(() => {
    const benefits = CHAIN_SPECIFIC_BENEFITS[chainId]

    return {
      randomImage: SURPLUS_IMAGES[getRandomInt(0, SURPLUS_IMAGES.length - 1)],
      randomBenefit: benefits[getRandomInt(0, benefits.length - 1)],
    }
  }, [chainId])

  const { surplusPercent, showSurplus } = surplusData || {}
  const shouldShowSurplus = debugForceShowSurplus || showSurplus
  const surplusPercentValue = surplusPercent ? parseFloat(surplusPercent).toFixed(2) : 'N/A'

  const renderProgressTopSectionContent = useMemo(() => {
    switch (stepName) {
      case 'initial':
        return <InitialTopSection stepName={stepName} order={order} />
      case 'solving':
      case 'solved':
      case 'unfillable':
      case 'delayed':
      case 'submissionFailed':
        return (
          <ProgressImageWrapper stepName={stepName}>
            {stepName === 'unfillable' && <UnfillableTopSection />}

            {(stepName === 'delayed' || stepName === 'submissionFailed' || stepName === 'solved') && (
              <DelayedSolvedSubmissionFailedTopSection />
            )}

            {stepName === 'solving' && <SolvingTopSection stepName={stepName} countdown={countdown || 0} />}
          </ProgressImageWrapper>
        )
      case 'executing':
        return <ExecutingTopSection stepName={stepName} />
      case 'finished':
      case 'cancellationFailed':
        return (
          <FinishedCancellationFailedTopSection
            stepName={stepName}
            order={order}
            randomImage={randomImage}
            shouldShowSurplus={shouldShowSurplus}
            surplusPercentValue={surplusPercentValue}
            randomBenefit={randomBenefit}
          />
        )
      case 'cancelling':
      case 'cancelled':
        return <CancelledCancellingTopSection stepName={stepName} />
      case 'expired':
        return <ExpiredTopSection stepName={stepName} />
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
          {renderProgressTopSectionContent}
        </motion.div>
      </AnimatePresence>
      {!hideIntent && <OrderIntent order={order} />}
    </styledEl.ProgressTopSection>
  )
}
