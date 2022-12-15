import styled from 'styled-components/macro'
import { NavLink } from 'react-router-dom'

export const MenuItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 500;
  margin-right: 6px;
`

export const Link = styled(NavLink)<{ isActive?: boolean }>`
  text-decoration: none;
  padding: 0 5px;
  opacity: 0.5;
  color: ${({ theme }) => (theme.darkMode ? theme.text1 : theme.text2)};
  text-decoration-color: ${({ theme }) => theme.blue1}!important;

  &.active,
  &.active + div {
    opacity: 1;
  }
`

export const Badge = styled.div`
  background-color: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.white};
  pointer-events: none;
  opacity: 0.5;
  border: none;
  cursor: pointer;
  border-radius: 16px;
  font-size: 10px;
  padding: 4px 8px;
`
