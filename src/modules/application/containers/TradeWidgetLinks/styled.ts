import { transparentize } from 'polished'
import { NavLink } from 'react-router-dom'
import styled, { css } from 'styled-components/macro'

export const Badge = styled.div`
  background: transparent;
  color: ${({ theme }) => transparentize(0.4, theme.text1)};
  border: 0;
  cursor: pointer;
  border-radius: 16px;
  font-size: 9px;
  font-weight: inherit;
  text-transform: uppercase;
  padding: 0;
  letter-spacing: 0.2px;
  font-weight: 600;
  transition: color 0.15s ease-in-out;
  margin: -8px 0 0 0;
`

export const Link = styled(NavLink)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: ${({ theme }) => transparentize(0.4, theme.text1)};
  gap: 3px;
  font-weight: inherit;
  line-height: 1;
  transition: color 0.15s ease-in-out;

  &:hover,
  &:hover > ${Badge} {
    color: ${({ theme }) => theme.text1};
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
        margin: 0 0 0 3px;
      }
    `}
`
