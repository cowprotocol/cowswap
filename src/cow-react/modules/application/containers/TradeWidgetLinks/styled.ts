import styled from 'styled-components/macro'
import { NavLink } from 'react-router-dom'

export const Link = styled(NavLink)<{ isActive?: boolean }>`
  text-decoration: none;
  padding: 0 5px;
  opacity: 0.5;

  &.active {
    opacity: 1;
  }
`
