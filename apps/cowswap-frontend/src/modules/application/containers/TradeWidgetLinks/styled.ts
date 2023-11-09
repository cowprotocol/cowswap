import { NavLink } from 'react-router-dom'
import styled, { css } from 'styled-components/macro'

import { UI } from 'common/constants/theme'

import { BadgeType } from '.'

const badgeBackgrounds: Record<BadgeType, string> = {
  information: `var(${UI.COLOR_INFORMATION_BG})`,
  alert: `var(${UI.COLOR_ALERT_BG})`,
  alert2: `var(${UI.COLOR_ALERT2_BG})`,
  success: `var(${UI.COLOR_SUCCESS_BG})`,
  default: 'transparent', // text only
}

const badgeColors: Record<BadgeType, string> = {
  information: `var(${UI.COLOR_INFORMATION_TEXT})`,
  alert: `var(${UI.COLOR_ALERT_TEXT})`,
  alert2: `var(${UI.COLOR_ALERT2_TEXT})`,
  success: `var(${UI.COLOR_SUCCESS_TEXT})`,
  default: `var(${UI.COLOR_TEXT1_INACTIVE})`, // text only
}

export const Badge = styled.div<{ type?: BadgeType }>`
  background: ${({ type }) => badgeBackgrounds[type || 'default']};
  color: ${({ type }) => badgeColors[type || 'default']};
  border: 0;
  cursor: pointer;
  border-radius: 16px;
  font-size: 9px;
  font-weight: inherit;
  text-transform: uppercase;
  padding: ${({ type }) => (!type || type === 'default' ? '0' : '4px 6px')};
  letter-spacing: 0.2px;
  font-weight: 600;
  transition: color 0.15s ease-in-out;
  margin: 0;

  a & {
    color: ${({ type }) => badgeColors[type || 'default']};
  }
`

Badge.defaultProps = {
  type: 'default',
}

export const Link = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(${UI.COLOR_TEXT1});
  gap: 4px;
  font-weight: inherit;
  line-height: 1;
  transition: color 0.15s ease-in-out, fill 0.15s ease-in-out;

  &:hover {
    color: inherit;
    text-decoration: none;

    > svg > path {
      fill: var(${UI.COLOR_TEXT1});
    }
  }

  > svg > path {
    fill: var(${UI.COLOR_TEXT1});
  }
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
    transition: background 0.2s ease-in-out;

    &:hover {
      background: var(${UI.COLOR_GREY});
    }

    ${({ isActive }) =>
      isActive &&
      css`
        background: var(${UI.COLOR_GREY});

        ${Link} {
          color: var(${UI.COLOR_TEXT1});
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
      `}
  }
`

export const SelectMenu = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 100;
  left: 0;
  top: 0;
  padding: 16px;
  gap: ${({ theme }) => (theme.isInjectedWidgetMode ? '16px' : '24px')};
  background: var(${UI.COLOR_CONTAINER_BG_01});
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
`
