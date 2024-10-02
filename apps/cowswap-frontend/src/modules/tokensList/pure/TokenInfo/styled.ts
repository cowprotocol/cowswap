import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  text-align: left;
  gap: 16px;
  font-weight: 500;

  ${Media.upToSmall()} {
    gap: 10px;
  }
`

export const TokenName = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: inherit;
  opacity: 0.6;
`

export const TokenDetails = styled.div`
  display: flex;
  flex-flow: column wrap;
  flex: 1 1 100%;
  gap: 4px;
`
