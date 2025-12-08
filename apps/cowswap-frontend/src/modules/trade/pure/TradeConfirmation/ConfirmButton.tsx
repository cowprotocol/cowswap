import { ReactNode, useEffect, useState } from 'react'

import { ButtonPrimary, ButtonSize, CenteredDots, LongLoadText } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { SigningStepState } from 'entities/trade'

import { upToMedium, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { getPendingText } from './getPendingText'

interface ConfirmButtonProps {
  buttonText: ReactNode
  isButtonDisabled: boolean
  hasPendingTrade: boolean
  onConfirm(): Promise<void | boolean>
  signingStep: SigningStepState | null
}
export function ConfirmButton(props: ConfirmButtonProps): ReactNode {
  const [isConfirmClicked, setIsConfirmClicked] = useState(false)
  const { buttonText, onConfirm, hasPendingTrade, signingStep } = props

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
    <ButtonPrimary onClick={handleConfirmClick} disabled={isButtonDisabled} buttonSize={ButtonSize.BIG}>
      {hasPendingTrade || isConfirmClicked ? (
        <LongLoadText fontSize={15} fontWeight={500}>
          <span>{signingStep ? getPendingText(signingStep) : t`Confirm with your wallet`}</span>
          <CenteredDots smaller />
        </LongLoadText>
      ) : (
        <>{buttonText}</>
      )}
    </ButtonPrimary>
  )
}
