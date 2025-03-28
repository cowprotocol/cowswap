import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  text-align: left;
  gap: 12px;
  font-weight: 500;
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;

  ${Media.upToSmall()} {
    gap: 10px;
  }
`

export const TokenName = styled.div`
  font-size: 13px;
  font-weight: 400;
  color: inherit;
  opacity: 0.6;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const TokenDetails = styled.div`
  display: flex;
  flex-flow: column wrap;
  flex: 1 1 auto;
  gap: 4px;
  min-width: 0;
`

export const TokenSymbolWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

export const TokenNameRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
`
