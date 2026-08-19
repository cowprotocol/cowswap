import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const PaginationBox = styled.nav`
  width: 100%;
  display: flex;
  overflow-x: auto;
  text-align: center;
  margin: 20px auto 10px;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;

  ${Media.upToLarge()} {
    justify-content: flex-start;

    /* Center the controls while they fit; auto margins collapse to 0 when the row overflows. */
    > :first-child {
      margin-left: auto;
    }

    > :last-child {
      margin-right: auto;
    }
  }
`
