import { UI } from '@cowprotocol/ui'

import { MenuButton, MenuList, MenuItem } from '@reach/menu-button'
import styled, { css } from 'styled-components/macro'

const ChainItem = css<{ active$?: boolean }>`
  display: inline-block;
  border-radius: 14px;
  padding: 6px;
  border: ${({ active$ }) => `1px solid var(${active$ ? UI.COLOR_TEXT_OPACITY_50 : UI.COLOR_TEXT_OPACITY_10})`};
  cursor: pointer;
  line-height: 0;
  background: transparent;
  outline: none;
  margin: 0 8px 8px 0;
  vertical-align: top;
  background: ${({ active$ }) => (active$ ? `var(${UI.COLOR_TEXT_OPACITY_10})` : '')};

  &:hover {
    border-color: var(${UI.COLOR_TEXT_OPACITY_25});
  }

  &:focus {
    outline: 1px solid var(${UI.COLOR_TEXT_OPACITY_25});
  }

  > img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }
`

export const Wrapper = styled.div`
  width: 100%;
`

export const ShimmerItem = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 16px;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  overflow: hidden;
  display: inline-block;
  margin-right: 8px;

  &:before {
    content: '';
    width: 36px;
    height: 36px;
    display: block;
    transform: translateX(-100%);
    ${({ theme }) => theme.shimmer};
  }
`

export const ChainButton = styled.button`
  ${ChainItem};
`

export const MenuChainButton = styled.button`
  ${ChainItem};
  margin: 0;
  padding: 0;

  &:hover {
    outline: none;
    border-color: var(${UI.COLOR_TEXT_OPACITY_10});
  }
`

export const MenuWrapper = styled.div`
  position: relative;
  display: inline-block;
  vertical-align: top;
`
export const MenuButtonStyled = styled(MenuButton)`
  ${ChainItem};
`

export const MenuListStyled = styled(MenuList)`
  position: absolute;
  right: 0;
  top: 40px;
  z-index: 12;
  border-radius: 12px;
  padding: 4px;
  background: var(${UI.COLOR_PAPER});
  box-shadow: var(${UI.BOX_SHADOW});
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  outline: none;
  overflow: hidden;
`

export const MenuItemStyled = styled(MenuItem)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 8px;
  margin: 2px;
  min-width: 200px;
  justify-content: end;
  cursor: pointer;

  &:hover,
  &:focus {
    background: var(${UI.COLOR_PAPER_DARKER});
  }
`

export const TextButton = styled.span`
  height: 24px;
  min-width: 24px;
  padding: 0 2px;
  text-align: center;
  justify-content: space-around;
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  gap: 4px;
  color: var(${UI.COLOR_TEXT});
`
