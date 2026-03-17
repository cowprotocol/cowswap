import { ButtonSecondary, Media, StatusColorVariant } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Button = styled(ButtonSecondary).attrs({
  status: StatusColorVariant.Success,
  width: 'auto',
  padding: '0 16px',
  $gap: '8px',
  $borderRadius: '999px 3px 3px 999px',
})`
  align-self: stretch;
  flex-flow: row nowrap;
  margin: 3px 0 3px 3px;
  font-size: 15px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  ${Media.upToMedium()} {
    padding: 0 12px;
  }
`
