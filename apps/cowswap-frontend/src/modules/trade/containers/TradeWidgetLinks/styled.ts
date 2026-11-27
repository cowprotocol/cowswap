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

const linkStyles = css`
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

export const Link = styled(NavLink)`
  ${linkStyles};
`

export const PageLink = styled.a`
  ${linkStyles};
`

export const DisabledLink = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  gap: 4px;
  font-weight: inherit;
  line-height: 1;
  cursor: not-allowed;
`

export const DisabledLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`

export const DropdownTriggerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin: 0;
  border: none;
  background: transparent;
  font: inherit;
  font-size: ${({ theme }) => (theme.isWidget ? '16px' : '14px')};
  font-weight: ${({ theme }) => (theme.isWidget ? '600' : '500')};
  line-height: 1;
  color: inherit;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
  min-height: 28px;

  &:hover:not(:disabled) {
    background: var(${UI.COLOR_PAPER_DARKER});
  }

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_PRIMARY});
    outline-offset: 2px;
  }

  &:disabled {
    cursor: default;
  }

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

export const MenuItem = styled.div<{ isActive?: boolean; isDropdownVisible: boolean; isDisabled?: boolean }>`
  display: flex;
  align-items: center;
  color: inherit;

  ${({ isDisabled }) =>
    isDisabled &&
    css`
      opacity: 0.4;
    `}

  > a,
  ${DisabledLink} {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    text-align: left;
    font-size: ${({ theme }) => (theme.isWidget ? '16px' : '14px')};
    font-weight: ${({ theme }) => (theme.isWidget ? '600' : '500')};
    border-radius: var(${UI.BORDER_RADIUS_NORMAL});
    padding: ${({ theme }) => (theme.isWidget ? '7px' : '5px 10px')};
    background: transparent;
    transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
    color: inherit;

    &:hover {
      background: ${({ isDisabled }) => (isDisabled ? 'transparent' : `var(${UI.COLOR_PAPER_DARKER})`)};
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

  ${({ isDisabled, isDropdownVisible, theme }) =>
    isDisabled &&
    css`
      ${DisabledLink} {
        padding: 0;
      }

      ${DisabledLabel} {
        padding: ${getMenuItemPadding(theme.isWidget, isDropdownVisible)};
      }
    `}
`

function getMenuItemPadding(isWidget: boolean, isDropdownVisible: boolean): string {
  if (isDropdownVisible) return '16px'

  return isWidget ? '7px' : '5px 10px'
}

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
  overflow: hidden;

  > div:first-child {
    margin-bottom: ${({ theme }) => (theme.isWidget ? '16px' : '24px')};
  }
`

export const TradeWidgetContent = styled.div`
  padding: 16px;
`
