import styled from 'styled-components/macro'
import { NavLink } from 'react-router-dom'
import { transparentize } from 'polished'

export const Badge = styled.div`
  background: ${({ theme }) => theme.grey1};
  color: ${({ theme }) => transparentize(0.4, theme.text1)};
  border: none;
  cursor: pointer;
  border-radius: 16px;
  font-size: 10px;
  font-weight: inherit;
  text-transform: uppercase;
  padding: 4px 6px;
  letter-spacing: 0.2px;
  font-weight: 600;
  transition: color 0.15s ease-in-out;
`

export const Link = styled(NavLink)<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: ${({ theme }) => transparentize(0.4, theme.text1)};
  gap: 3px;
  font-weight: inherit;
  line-height: 1;
  transition: color 0.15s ease-in-out;

  &.active {
    font-weight: 600;
  }

  &:hover,
  &.active,
  &.active + div,
  &:hover > ${Badge}, &.active > ${Badge} {
    color: ${({ theme }) => theme.text1};
  }
`

export const Wrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 10px;

  ${Link} {
    text-decoration: none;
  }
`

export const MenuItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 500;
`
