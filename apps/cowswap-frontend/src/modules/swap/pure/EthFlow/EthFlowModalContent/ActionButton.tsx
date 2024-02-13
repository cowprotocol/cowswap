import { Loader, ButtonPrimary } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;

  > button {
    min-width: 100%;
    min-height: 60px;
  }
`

export interface ActionButtonProps {
  label: string
  showLoader: boolean
  onClick: () => void
}

export function ActionButton(props: ActionButtonProps) {
  const { showLoader, label, onClick } = props

  return (
    <ButtonWrapper>
      <ButtonPrimary padding="0.5rem" maxWidth="70%" disabled={showLoader} onClick={onClick}>
        {showLoader ? <Loader /> : <Trans>{label}</Trans>}
      </ButtonPrimary>
    </ButtonWrapper>
  )
}
