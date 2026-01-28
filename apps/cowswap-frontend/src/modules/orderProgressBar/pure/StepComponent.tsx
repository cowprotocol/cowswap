import React, { Suspense, lazy } from 'react'

import LOTTIE_RED_CROSS from '@cowprotocol/assets/lottie/red-cross.json'

import * as styledEl from './styled'

import { StepStatus } from '../constants'
import { Description } from '../sharedStyled'

const Lottie = lazy(() => import('lottie-react'))

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function StepComponent({
  status,
  isFirst,
  step,
  index,
  extraContent,
  customColor,
  isUnfillable,
  isCancelling,
}: {
  status: StepStatus
  isFirst: boolean
  step: { title: string }
  index: number
  extraContent?: React.ReactNode
  customColor?: string
  isUnfillable?: boolean
  isCancelling?: boolean
}) {
  return (
    <styledEl.Step status={status} isFirst={isFirst}>
      <styledEl.NumberedElement
        status={status}
        customColor={customColor}
        $isUnfillable={isUnfillable}
        $isCancelling={isCancelling}
      >
        {status === StepStatus.CANCELLING ? (
          // TODO: what fallback should be used here?
          <Suspense fallback={null}>
            <Lottie
              animationData={LOTTIE_RED_CROSS}
              loop={true}
              autoplay={true}
              style={{ width: '24px', height: '24px' }}
            />
          </Suspense>
        ) : (
          <>
            {index + 1}
            {status === StepStatus.ACTIVE && !isUnfillable && <styledEl.Spinner />}
          </>
        )}
      </styledEl.NumberedElement>
      <styledEl.Content>
        <styledEl.Title customColor={customColor}>{step.title}</styledEl.Title>
        {status !== StepStatus.NEXT && extraContent && <Description>{extraContent}</Description>}
      </styledEl.Content>
    </styledEl.Step>
  )
}
