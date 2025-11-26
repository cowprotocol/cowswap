import React from 'react'

import { UI } from '@cowprotocol/ui'

import { msg } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import * as styledEl from './styled'

import { Description } from '../../sharedStyled'
import { StepsWrapper } from '../StepsWrapper'

interface CancellingStepProps {
  children: React.ReactNode
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CancellingStep({ children }: CancellingStepProps) {
  return (
    <styledEl.ProgressContainer>
      {children}
      <StepsWrapper
        steps={[{ title: msg`Cancelling` }]}
        currentStep={0}
        extraContent={
          <Description>
            <Trans>Your order is being cancelled.</Trans>
          </Description>
        }
        customColor={`var(${UI.COLOR_DANGER_TEXT})`}
        isCancelling={true}
      />
    </styledEl.ProgressContainer>
  )
}
