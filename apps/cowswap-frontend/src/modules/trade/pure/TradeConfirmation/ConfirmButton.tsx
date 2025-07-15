import { ReactNode, useEffect, useState } from 'react'

import { ButtonPrimary, ButtonSize, CenteredDots, LongLoadText } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { upToMedium, useMediaQuery } from 'legacy/hooks/useMediaQuery'

interface ConfirmButtonProps {
  buttonText: ReactNode
  isButtonDisabled: boolean
  hasPendingTrade: boolean
  onConfirm(): Promise<void | boolean>
}
export function ConfirmButton(props: ConfirmButtonProps): ReactNode {
  const [isConfirmClicked, setIsConfirmClicked] = useState(false)
  const { buttonText, onConfirm, hasPendingTrade } = props

  const isButtonDisabled = props.isButtonDisabled || isConfirmClicked

  const isUpToMedium = useMediaQuery(upToMedium)

  const handleConfirmClick = async (): Promise<void> => {
    if (isUpToMedium) {
      window.scrollTo({ top: 0, left: 0 })
    }

    setIsConfirmClicked(true)
    const isConfirmed = await onConfirm()

    if (!isConfirmed) {
      setIsConfirmClicked(false)
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
          Confirm with your wallet <CenteredDots smaller />
        </LongLoadText>
      ) : (
        <Trans>{buttonText}</Trans>
      )}
    </ButtonPrimary>
  )
}
