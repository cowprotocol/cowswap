import { Media, RowFixed, UI } from '@cowprotocol/ui'

import { MenuButton, MenuList } from '@reach/menu-button'
import { transparentize } from 'color2k'
import styled from 'styled-components/macro'

export const StyledMenuButton = styled(MenuButton)`
  position: relative;
  width: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  border-radius: 0.5rem;
  height: var(${UI.ICON_SIZE_NORMAL});
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  color: inherit;
  display: flex;
  align-items: center;

  &:hover,
  &:focus {
    opacity: 1;
    cursor: pointer;
    outline: none;
    color: currentColor;
  }

  svg {
    opacity: 1;
    margin: auto;
    transition: transform 0.3s cubic-bezier(0.65, 0.05, 0.36, 1);
    color: inherit;
  }
`

export const StyledMenu = styled.div`
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
  color: inherit;

  ${RowFixed} {
    color: inherit;

    > div {
      color: inherit;
      opacity: 0.85;
    }
  }
`

export const MenuFlyout = styled(MenuList)`
  min-width: 20.125rem;
  background: var(${UI.COLOR_PRIMARY});
  box-shadow:
    0px 0px 1px rgba(0, 0, 0, 0.01),
    0px 4px 8px rgba(0, 0, 0, 0.04),
    0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  z-index: 100;
  color: inherit;
  box-shadow: ${({ theme }) => theme.boxShadow2};
  border: 1px solid ${({ theme }) => transparentize(theme.white, 0.95)};
  background-color: var(${UI.COLOR_PAPER});
  color: inherit;
  padding: 0;
  margin: 0;
  top: 36px;
  right: 0;
  width: 280px;

  ${Media.upToMedium()} {
    min-width: 18.125rem;
  }
`
