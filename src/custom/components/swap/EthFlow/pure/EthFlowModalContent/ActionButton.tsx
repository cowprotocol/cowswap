import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import Loader from 'components/Loader'
import { ButtonPrimary } from 'components/Button'

const ButtonWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
  > button {
    min-width: 90%;
    min-height: 60px;
  }
`

export interface ActionButtonProps {
  label: string
  showButton: boolean
  showLoader: boolean
  buttonProps: {
    disabled: boolean
    onClick: (() => Promise<void>) | undefined
  }
}

export function ActionButton(props: ActionButtonProps) {
  const { showButton, showLoader, buttonProps, label } = props

  if (!showButton) return null
  return (
    <ButtonWrapper>
      <ButtonPrimary padding="0.5rem" maxWidth="70%" {...buttonProps}>
        {showLoader ? <Loader /> : <Trans>{label}</Trans>}
      </ButtonPrimary>
    </ButtonWrapper>
  )
}
