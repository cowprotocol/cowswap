import React from 'react'

import LOTTIE_RED_CROSS from '@cowprotocol/assets/lottie/red-cross.json'

import Lottie from 'lottie-react'

import * as styledEl from './styled'

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
  status: 'cancelling' | 'cancelled' | 'expired' | 'active' | 'next' | 'future' | 'done'
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
        {status === 'cancelling' ? (
          <Lottie
            animationData={LOTTIE_RED_CROSS}
            loop={true}
            autoplay={true}
            style={{ width: '24px', height: '24px' }}
          />
        ) : (
          <>
            {index + 1}
            {status === 'active' && !isUnfillable && <styledEl.Spinner />}
          </>
        )}
      </styledEl.NumberedElement>
      <styledEl.Content>
        <styledEl.Title customColor={customColor}>{step.title}</styledEl.Title>
        {status !== 'next' && extraContent && <styledEl.Description>{extraContent}</styledEl.Description>}
      </styledEl.Content>
    </styledEl.Step>
  )
}
