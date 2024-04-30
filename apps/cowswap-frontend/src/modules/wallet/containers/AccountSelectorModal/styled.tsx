import Close from '@cowprotocol/assets/images/x.svg?react'
import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const CloseIcon = styled((props) => <Close {...props} />)`
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  stroke: var(${UI.COLOR_TEXT});
  width: 24px;
  height: 24px;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;

  h3 {
    display: flex;
    gap: 10px;
    margin: 0;
  }
`

export const Wrapper = styled.div`
  padding: 20px;
  width: 100%;
`

export const WalletIcon = styled.img`
  width: 24px;
  height: 24px;
`
