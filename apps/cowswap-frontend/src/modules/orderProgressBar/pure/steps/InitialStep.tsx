import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import * as styledEl from './styled'

import { STEPS } from '../../constants'
import { Description } from '../../sharedStyled'
import { StepsWrapper } from '../StepsWrapper'

interface InitialStepProps {
  children: ReactNode
  isBridgingTrade: boolean
  hideSteps?: boolean
}

export function InitialStep({ children, isBridgingTrade, hideSteps = false }: InitialStepProps): ReactNode {
  return (
    <styledEl.ProgressContainer>
      {children}
      {!hideSteps && (
        <StepsWrapper
          isBridgingTrade={isBridgingTrade}
          steps={STEPS}
          currentStep={0}
          extraContent={
            <Description>
              <Trans>On CoW Swap, orders placed at the same time are</Trans>{' '}
              <styledEl.Link
                href="https://cow.fi/learn/understanding-batch-auctions"
                target="_blank"
                data-click-event={toCowSwapGtmEvent({
                  category: CowSwapAnalyticsCategory.PROGRESS_BAR,
                  action: 'Click Learn More',
                  label: 'Initial',
                })}
              >
                <Trans>batched together</Trans>
              </styledEl.Link>{' '}
              <Trans>to save on costs!</Trans>
            </Description>
          }
        />
      )}
    </styledEl.ProgressContainer>
  )
}
