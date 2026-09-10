import { ReactNode, useRef } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { ButtonPrimary, ButtonSize, CenteredDots, LongLoadText, Media } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { SigningStepState } from 'entities/trade'

import { getPendingText } from './getPendingText'

interface ConfirmButtonProps {
  buttonText: ReactNode
  isButtonDisabled: boolean
  /** Owned by `useFreezeOnConfirm`: true from the click until the flow resolves, fails or aborts */
  isConfirming: boolean
  onConfirm(): Promise<void | boolean>
  signingStep: SigningStepState | null
  clickEvent?: string
}
export function ConfirmButton(props: ConfirmButtonProps): ReactNode {
  const confirmInFlightRef = useRef(false)
  const { buttonText, onConfirm, isConfirming, isButtonDisabled, signingStep, clickEvent } = props

  const isUpToMedium = useMediaQuery(Media.upToMedium(false))

  const handleConfirmClick = async (): Promise<void> => {
    if (confirmInFlightRef.current) return
    confirmInFlightRef.current = true

    if (isUpToMedium) {
      window.scrollTo({ top: 0, left: 0 })
    }

    try {
      await onConfirm()
    } finally {
      confirmInFlightRef.current = false
    }
  }

  const pendingText = (signingStep ? getPendingText(signingStep) : null) || t`Confirm with your wallet`

  return (
    <ButtonPrimary
      onClick={handleConfirmClick}
      disabled={isButtonDisabled}
      buttonSize={ButtonSize.BIG}
      data-click-event={clickEvent}
    >
      {isConfirming ? (
        <LongLoadText fontSize={15} fontWeight={500}>
          <span>{pendingText}</span>
          <CenteredDots smaller />
        </LongLoadText>
      ) : (
        <>{buttonText}</>
      )}
    </ButtonPrimary>
  )
}
