import { ReactComponent as Close } from '@cowprotocol/assets/images/x.svg'

import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

export const CloseIcon = styled(Close)`
  opacity: 0.6;
  transition: opacity 0.3s ease-in-out;
  stroke: var(${UI.COLOR_TEXT1});
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
