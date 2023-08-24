import { transparentize } from 'polished'
import { NavLink } from 'react-router-dom'
import styled, { css } from 'styled-components/macro'

import { BadgeType } from '.'

const badgeBackgrounds: Record<BadgeType, string> = {
  information: 'var(--cow-color-information-bg)',
  alert: 'var(--cow-color-alert-bg)',
  alert2: 'var(--cow-color-alert2-bg)',
  success: 'var(--cow-color-success-bg)',
  default: 'transparent', // text only
};

const badgeColors: Record<BadgeType, string> = {
  information: 'var(--cow-color-information-text)',
  alert: 'var(--cow-color-alert-text)',
  alert2: 'var(--cow-color-alert2-text)',
  success: 'var(--cow-color-success-text)',
  default: 'var(--cow-color-text1-inactive)', // text only
};

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
  margin: -8px 0 0 0;

  a & {
    color: ${({ type }) => badgeColors[type || 'default']};
  }
`

Badge.defaultProps = {
  type: 'default'
};

export const Link = styled(NavLink)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: ${({ theme }) => transparentize(0.4, theme.text1)};
  gap: 3px;
  font-weight: inherit;
  line-height: 1;
  transition: color 0.15s ease-in-out;

  &:hover {
    color: inherit;
  }
`

export const Wrapper = styled.div`
  background: transparent;
  border-radius: 16px;
  padding: 0;
  display: flex;
  flex-flow: row wrap;
  gap: 0;

  ${Link} {
    text-decoration: none;
  }
`

export const MenuItem = styled.div<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  border-radius: 16px;
  padding: 5px 10px;
  background: transparent;
  transition: background 0.2 ease-in-out;

  ${({ isActive, theme }) =>
    isActive &&
    css`
      background: ${theme.grey1};

      ${Link} {
        color: ${theme.text1};
      }

      ${Link} > ${Badge} {
        display: none;
      }
    `}
`
