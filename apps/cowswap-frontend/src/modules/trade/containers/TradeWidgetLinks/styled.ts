import { Badge, UI } from '@cowprotocol/ui'

import { NavLink } from 'react-router'
import styled, { css } from 'styled-components/macro'

const ItemWithIcon = css`
  svg {
    width: 10px;
    height: 10px;
    margin: 0 auto;
    object-fit: contain;

    path {
      fill: currentColor;
      transition: fill var(${UI.ANIMATION_DURATION}) ease-in-out;
    }
  }

  &:hover {
    color: inherit;
    text-decoration: none;

    svg > path {
      fill: currentColor;
    }
  }

  svg > path {
    fill: currentColor;
  }
`

export const Link = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: inherit;
  gap: 4px;
  font-weight: inherit;
  line-height: 1;
  transition:
    color var(${UI.ANIMATION_DURATION}) ease-in-out,
    fill var(${UI.ANIMATION_DURATION}) ease-in-out;

  ${ItemWithIcon};
`

export const DropdownButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: inherit;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  padding: 5px 10px;

  ${ItemWithIcon};
`

export const Wrapper = styled.div`
  background: transparent;
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  padding: 0;
  display: flex;
  flex-flow: row wrap;
  gap: 0;

  ${Link} {
    text-decoration: none;
  }
`

export const MenuItem = styled.div<{ isActive?: boolean; isDropdownVisible: boolean }>`
  display: flex;
  align-items: center;
  color: inherit;

  > a {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    text-align: left;
    font-size: ${({ theme }) => (theme.isInjectedWidgetMode ? '16px' : '14px')};
    font-weight: ${({ theme }) => (theme.isInjectedWidgetMode ? '600' : '500')};
    border-radius: var(${UI.BORDER_RADIUS_NORMAL});
    padding: ${({ theme }) => (theme.isInjectedWidgetMode ? '7px' : '5px 10px')};
    background: transparent;
    transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
    color: inherit;

    &:hover {
      background: var(${UI.COLOR_PAPER_DARKER});
    }

    ${({ isActive }) =>
      isActive &&
      css`
        background: var(${UI.COLOR_PAPER_DARKER});

        ${Link} {
          color: inherit;
        }

        ${Link} > ${Badge} {
          display: none;
        }
      `}

    ${({ isDropdownVisible }) =>
      isDropdownVisible &&
      css`
        padding: 16px;
        width: 100%;
        margin: 0 0 10px;
      `}
  }
`

export const SelectMenu = styled.div`
  display: block;
  width: 100%;
  min-height: 100%;
  position: absolute;
  z-index: 100;
  left: 0;
  top: 0;
  background: var(${UI.COLOR_PAPER});
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});

  > div:first-child {
    margin-bottom: ${({ theme }) => (theme.isInjectedWidgetMode ? '16px' : '24px')};
  }
`

export const TradeWidgetContent = styled.div`
  padding: 16px;
`
