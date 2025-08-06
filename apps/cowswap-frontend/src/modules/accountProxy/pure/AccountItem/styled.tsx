import { UI } from '@cowprotocol/ui'
import { JazzIcon } from '@cowprotocol/wallet'

import { Link } from 'react-router'
import styled from 'styled-components/macro'

import accountContainerImg from '../../img/account-container.svg'

export const Wrapper = styled(Link)`
  width: 100%;
  display: grid;
  align-items: center;
  justify-content: center;
  grid-template-columns: 100px 1fr 30px;
  grid-template-rows: max-content;
  margin-bottom: 10px;
  cursor: pointer;
  border-radius: 8px;
  text-decoration: none;

  &:hover {
    background: var(${UI.COLOR_PRIMARY_OPACITY_10});
  }
`

export const IconWrapper = styled.div`
  width: 100px;
  height: 67px;
  background-repeat: no-repeat;
  background-image: url(${accountContainerImg});
`

export const AccountWrapper = styled.div`
  width: 100%;

  > h3,
  p {
    margin: 0;
    padding: 0;
  }

  > p {
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`

export const JazzIconStyled = styled(JazzIcon)`
  position: relative;
  left: -10px;
`
