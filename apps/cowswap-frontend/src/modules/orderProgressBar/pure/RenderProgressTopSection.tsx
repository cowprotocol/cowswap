import { ReactNode, useMemo } from 'react'

import { getRandomInt } from '@cowprotocol/common-utils'

import { AnimatePresence, motion } from 'framer-motion'

import { FinishedStepContentSection } from './FinishedStepContentSection'
import { ProgressSkeleton } from './ProgressSkeleton'
import { ProgressTopSection } from './ProgressTopSection'
import { OrderIntent } from './steps/OrderIntent'
import * as styledEl from './styled'

import { CHAIN_SPECIFIC_BENEFITS, SURPLUS_IMAGES } from '../constants'
import { useProgressBarLayout } from '../hooks/useProgressBarLayout'
import { OrderProgressBarProps } from '../types'

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
  const { cssVariables, isLayoutReady } = useProgressBarLayout()
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
  
  const isFinishedStep = stepName === 'finished' || stepName === 'cancellationFailed'
  const WrapperComponent = isFinishedStep ? FinishedStepContentSection : styledEl.ProgressTopSection

  return (
    <WrapperComponent style={cssVariables as React.CSSProperties}>
      {!isLayoutReady ? (
        <ProgressSkeleton />
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={stepName}
              initial={false}
              animate={{
                opacity: 1,
                width: '100%',
                transition: {
                  duration: 0.3,
                  ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
                },
              }}
              exit={{ opacity: 0, width: '100%' }}
              style={{ width: '100%' }}
            >
              {stepName && (
                <ProgressTopSection
                  stepName={stepName}
                  order={order}
                  countdown={countdown || 0}
                  randomImage={randomImage}
                  surplusPercentValue={surplusPercentValue}
                  randomBenefit={randomBenefit}
                  shouldShowSurplus={shouldShowSurplus}
                />
              )}
            </motion.div>
          </AnimatePresence>
          {!hideIntent && <OrderIntent order={order} />}
        </>
      )}
    </WrapperComponent>
  )
}
