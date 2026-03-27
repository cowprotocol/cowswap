import { ButtonSecondary, Media, StatusColorVariant } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Button = styled(ButtonSecondary).attrs({
  status: StatusColorVariant.Success,
  width: 'auto',
  padding: '0 16px',
  $gap: '8px',
  $borderRadius: '24px 6px 6px 24px !important',
})`
  align-self: stretch;
  flex-flow: row nowrap;
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  border: 3px solid transparent;
  background-clip: padding-box !important;
  margin-right: -3px;

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  ${Media.upToMedium()} {
    padding: 0 12px;
  }
`
