import { useMemo } from 'react'

import { getRandomInt } from '@cowprotocol/common-utils'

import { AnimatePresence, motion } from 'framer-motion'

import { ProgressTopSection } from './ProgressTopSection'
import { OrderIntent } from './steps/OrderIntent'
import * as styledEl from './styled'

import { CHAIN_SPECIFIC_BENEFITS, SURPLUS_IMAGES } from '../constants'
import { OrderProgressBarProps } from '../types'

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function RenderProgressTopSection({
  stepName,
  order,
  countdown = 0,
  chainId,
  surplusData,
  debugForceShowSurplus = false,
}: Pick<OrderProgressBarProps, 'stepName' | 'order' | 'countdown' | 'chainId' | 'surplusData'> & {
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
    </styledEl.ProgressTopSection>
  )
}
