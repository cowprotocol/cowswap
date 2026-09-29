import { ReactNode } from 'react'

import { ButtonPrimary, Media } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

export interface LoadMoreOrdersButtonProps {
  disabled: boolean
  onClick: () => void
}

export function LoadMoreOrdersButton({ disabled, onClick }: LoadMoreOrdersButtonProps): ReactNode {
  return (
    <LoadMoreButton onClick={onClick} disabled={disabled}>
      <Trans>Search older orders</Trans>
    </LoadMoreButton>
  )
}

export const LoadMoreButton = styled(ButtonPrimary)`
  margin: 12px auto 0;
  padding: 0 64px;
  width: auto;

  ${Media.upToExtraSmall()} {
    width: 100%;
    padding: 0 16px;
  }
`
