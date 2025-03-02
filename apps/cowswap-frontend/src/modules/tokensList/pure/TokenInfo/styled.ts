import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { LinkStyledButton } from 'theme'

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

export const AddressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 400;
  opacity: 0.6;
  margin-top: 2px;
`

export const Address = styled.a`
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`

export const CopyIconWrapper = styled.div`
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  
  ${AddressContainer}:hover & {
    opacity: 1;
  }
`
