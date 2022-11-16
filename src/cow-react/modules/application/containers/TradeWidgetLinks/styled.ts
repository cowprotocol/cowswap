import styled from 'styled-components/macro'
import { NavLink } from 'react-router-dom'

export const MenuItem = styled.div`
  font-size: 1rem;
  font-weight: 500;
  margin-right: 6px;
  color: ${({ theme }) => (theme.darkMode ? theme.text1 : theme.text2)}};
`

export const Link = styled(NavLink)<{ isActive?: boolean }>`
  text-decoration: none;
  padding: 0 5px;
  opacity: 0.5;
  display: flex;
  align-items: center;

  &.active {
    opacity: 1;
  }
`

export const Badge = styled.div`
  background-color: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.white};
  border: none;
  cursor: pointer;
  border-radius: 16px;
  font-size: 10px;
  padding: 4px 8px;
`
