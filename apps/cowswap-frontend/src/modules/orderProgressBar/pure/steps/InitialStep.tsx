import React from 'react'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import * as styledEl from './styled'

import { STEPS } from '../../constants'
import { StepsWrapper } from '../StepsWrapper'

interface InitialStepProps {
  children: React.ReactNode
}

export function InitialStep({ children }: InitialStepProps) {
  return (
    <styledEl.ProgressContainer>
      {children}
      <StepsWrapper
        steps={STEPS}
        currentStep={0}
        extraContent={
          <styledEl.Description>
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
          </styledEl.Description>
        }
      />
    </styledEl.ProgressContainer>
  )
}
