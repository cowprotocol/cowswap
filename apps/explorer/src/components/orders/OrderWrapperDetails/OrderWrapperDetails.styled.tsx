import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const WrapperList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-flow: column wrap;
  gap: 24px;
  min-width: 420px;

  ${Media.upToExtraSmall()} {
    min-width: 100%;
  }
`
