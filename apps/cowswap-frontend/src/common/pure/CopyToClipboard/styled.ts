import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const CopyWrapper = styled.div`
  display: flex;
  width: auto;

  ${Media.upToSmall()} {
    justify-content: flex-start;
  }
`

export const CopyMessage = styled.span`
  font-size: 12px;
  font-weight: 400;
  margin-left: 4px;
`

export const CopyIcon = styled.div`
  width: 12px;
  height: 12px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  padding: 0.2rem;
  margin-left: 4px;
  max-width: 20px;
  background-color: transparent;
  background-image: url('images/click-to-copy.svg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`
