import React, { ReactNode } from 'react'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import * as styledEl from './styled'

import { STEPS } from '../../constants'
import { Description } from '../../sharedStyled'
import { StepsWrapper } from '../StepsWrapper'

interface InitialStepProps {
  children: ReactNode
  isBridgingTrade: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function InitialStep({ children, isBridgingTrade }: InitialStepProps) {
  return (
    <styledEl.ProgressContainer>
      {children}
      <StepsWrapper
        isBridgingTrade={isBridgingTrade}
        steps={STEPS}
        currentStep={0}
        extraContent={
          <Description>
            On CoW Swap, orders placed at the same time are{' '}
            <styledEl.Link
              href="https://cow.fi/learn/understanding-batch-auctions"
              target="_blank"
              data-click-event={toCowSwapGtmEvent({
                category: CowSwapAnalyticsCategory.PROGRESS_BAR,
                action: 'Click Learn More',
                label: 'Initial',
              })}
            >
              batched together
            </styledEl.Link>{' '}
            to save on costs!
          </Description>
        }
      />
    </styledEl.ProgressContainer>
  )
}
