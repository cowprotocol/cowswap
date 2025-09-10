import { ReactNode, useEffect, useState } from 'react'

import { ButtonPrimary, ButtonSize, CenteredDots, LongLoadText } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { SigningStepState } from 'entities/trade'

import { upToMedium, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { getPendingText } from './getPendingText'

interface ConfirmButtonProps {
  buttonText: ReactNode
  isButtonDisabled: boolean
  hasPendingTrade: boolean
  onConfirm(): Promise<void | boolean>
  signingStep: SigningStepState | null
  'data-click-event'?: string
}
export function ConfirmButton(props: ConfirmButtonProps): ReactNode {
  const [isConfirmClicked, setIsConfirmClicked] = useState(false)
  const { buttonText, onConfirm, hasPendingTrade, signingStep, 'data-click-event': dataClickEvent } = props

  const isButtonDisabled = props.isButtonDisabled || isConfirmClicked

  const isUpToMedium = useMediaQuery(upToMedium)

  const handleConfirmClick = async (): Promise<void> => {
    if (isUpToMedium) {
      window.scrollTo({ top: 0, left: 0 })
    }

    setIsConfirmClicked(true)
    try {
      const isConfirmed = await onConfirm()

      if (!isConfirmed) {
        setIsConfirmClicked(false)
      }
    } catch (error) {
      setIsConfirmClicked(false)
      throw error
    }
  }

  useEffect(() => {
    if (!hasPendingTrade) {
      setIsConfirmClicked(false)
    }
  }, [hasPendingTrade])

  return (
    <ButtonPrimary 
      onClick={handleConfirmClick} 
      disabled={isButtonDisabled} 
      buttonSize={ButtonSize.BIG}
      data-click-event={dataClickEvent}
    >
      {hasPendingTrade || isConfirmClicked ? (
        <LongLoadText fontSize={15} fontWeight={500}>
          <span>{signingStep ? getPendingText(signingStep) : 'Confirm with your wallet'}</span>
          <CenteredDots smaller />
        </LongLoadText>
      ) : (
        <Trans>{buttonText}</Trans>
      )}
    </ButtonPrimary>
  )
}
