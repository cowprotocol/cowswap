import { UI, BadgeType } from '@cowprotocol/ui'

import { NavLink } from 'react-router-dom'
import styled, { css } from 'styled-components/macro'

const badgeBackgrounds: Record<BadgeType, string> = {
  information: `var(${UI.COLOR_INFO_BG})`,
  alert: `var(${UI.COLOR_BADGE_YELLOW_BG})`,
  alert2: `var(${UI.COLOR_BADGE_YELLOW_BG})`,
  success: `var(${UI.COLOR_SUCCESS_BG})`,
  default: 'transparent', // text only
}

const badgeColors: Record<BadgeType, string> = {
  information: `var(${UI.COLOR_INFO_TEXT})`,
  alert: `var(${UI.COLOR_BADGE_YELLOW_TEXT})`,
  alert2: `var(${UI.COLOR_BADGE_YELLOW_TEXT})`,
  success: `var(${UI.COLOR_SUCCESS_TEXT})`,
  default: `var(${UI.COLOR_DISABLED_TEXT})`, // text only
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
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;
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
  color: inherit;
  gap: 4px;
  font-weight: inherit;
  line-height: 1;
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out, fill var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    color: inherit;
    text-decoration: none;

    > svg > path {
      fill: currentColor;
    }
  }

  > svg > path {
    fill: currentColor;
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
        margin-bottom: 20px;
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
  gap: ${({ theme }) => (theme.isInjectedWidgetMode ? '16px' : '24px')};
  background: var(${UI.COLOR_PAPER});
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
`

export const TradeWidgetContent = styled.div`
  padding: 0 16px 16px 16px;
`
