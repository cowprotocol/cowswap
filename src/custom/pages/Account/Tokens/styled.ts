import { ChevronDown } from 'react-feather'
import { lighten } from 'polished'
import styled from 'styled-components/macro'

export const MenuWrapper = styled.div`
  position: relative;
`

export const MenuButton = styled.button`
  background: none;
  outline: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.text1};
  display: flex;
  align-items: center;
`

export const StyledChevronDown = styled(ChevronDown)`
  margin-left: 5px;
  font-sze: 14px;
`

export const Menu = styled.div`
  border-radius: 2px;
  background: ${({ theme }) => theme.bg5};
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 0;
  bottom: 0;
  transform: translateY(105%);
  max-width: 400px;
  min-width: 250px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
  z-index: 99;
`

export const MenuItem = styled.div`
  transition: background 0.2s ease-in;
  padding: 0.8rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;

  :not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.disabled};
  }

  :hover {
    background: ${({ theme }) => lighten(0.05, theme.bg5)};
  }
`
