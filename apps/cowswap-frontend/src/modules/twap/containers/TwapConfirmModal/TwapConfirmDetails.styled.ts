import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 7px;
  padding: 0 6px 6px;
  font-size: 13px;

  > b {
    display: block;
    margin: 0 0 3px;

    ${Media.upToSmall()} {
      margin: 0 0 10px;
    }
  }
`

export const TwapSplitTitle = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 3px;

  ${Media.upToSmall()} {
    margin: 0 0 10px;
  }
`
