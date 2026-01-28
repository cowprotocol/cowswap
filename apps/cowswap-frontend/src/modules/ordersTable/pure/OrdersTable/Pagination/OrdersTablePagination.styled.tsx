import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const PaginationBox = styled.div`
  width: 100%;
  display: flex;
  overflow-x: auto;
  text-align: center;
  margin: 20px auto 0;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;

  ${Media.upToSmall()} {
    justify-content: flex-start;
  }
`