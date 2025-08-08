import { UI } from '@cowprotocol/ui'

import { MenuButton as ReachMenuButton, MenuItems as ReachMenuItems } from '@reach/menu-button'
import styled from 'styled-components/macro'

import shadowCowImg from '../../img/shadow-cow.svg'

export const Wrapper = styled.div`
  width: 100%;
  min-height: 200px;
  border-radius: 24px;
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: 1fr auto;
  background-color: #f2f2f2;
  background-image: url(${shadowCowImg});
  background-repeat: no-repeat;
  background-position: right bottom;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  box-shadow: var(${UI.BOX_SHADOW_2});
`

export const LeftTop = styled.div`
  > span {
    font-size: 14px;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }

  > h2 {
    font-size: 36px;
    font-weight: 500;
  }
`

export const RightTop = styled.div`
  text-align: right;
  position: relative;
`

export const LeftBottom = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  font-family: monospace;
`

export const MenuButton = styled(ReachMenuButton)`
  display: block;
  float: right;
  background: none;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  color: var(${UI.COLOR_PRIMARY_OPACITY_80});
  cursor: pointer;

  &:hover {
    color: var(${UI.COLOR_TEXT});
  }
`

export const MenuItems = styled(ReachMenuItems)`
  background: var(${UI.COLOR_TEXT_OPACITY_10});
  box-shadow: var(${UI.BOX_SHADOW});
  right: 0;
  top: 20px;
  border-radius: 10px;
  position: absolute;
  min-width: 180px;
  text-align: left;
`
