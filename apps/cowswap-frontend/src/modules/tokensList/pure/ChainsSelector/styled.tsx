import { UI } from '@cowprotocol/ui'
import { Media } from '@cowprotocol/ui'

import { MenuList } from '@reach/menu-button'
import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: row;
  gap: 8px;
  width: 100%;

  ${Media.upToSmall()} {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */

    &::-webkit-scrollbar {
      display: none;
    }
  }
`

export const ChainItem = styled.button<{
  active$?: boolean
  iconOnly?: boolean
  iconSize?: number
  borderless?: boolean
  isLoading?: boolean
}>`
  --itemSize: 38px;
  width: ${({ iconOnly }) => (iconOnly ? 'var(--itemSize)' : 'auto')};
  height: var(--itemSize);
  display: flex;
  align-items: center;
  justify-content: ${({ iconOnly }) => (iconOnly ? 'center' : 'flex-start')};
  gap: 4px;
  font-weight: 500;
  font-size: 13px;
  border-radius: 14px;
  padding: 6px;
  border: ${({ active$, borderless }) =>
    borderless ? 'none' : `1px solid var(${active$ ? UI.COLOR_PRIMARY_OPACITY_70 : UI.COLOR_TEXT_OPACITY_10})`};
  cursor: ${({ isLoading }) => (isLoading ? 'default' : 'pointer')};
  line-height: 1;
  outline: none;
  margin: 0;
  vertical-align: top;
  background: ${({ active$ }) => (active$ ? `var(${UI.COLOR_PAPER_DARKER})` : 'transparent')};
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  box-shadow: ${({ active$ }) =>
    active$
      ? `0px -1px 0px 0px var(${UI.COLOR_TEXT_OPACITY_10}) inset,
         0px 0px 0px 1px var(${UI.COLOR_PRIMARY_OPACITY_10}) inset,
         0px 1px 3px 0px var(${UI.COLOR_TEXT_OPACITY_10})`
      : '0'};
  transition:
    color 0.2s ease-in-out,
    background 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
  overflow: ${({ isLoading }) => (isLoading ? 'hidden' : 'visible')};
  position: relative;

  &:hover {
    border-color: ${({ isLoading }) =>
      isLoading ? `var(${UI.COLOR_TEXT_OPACITY_10})` : `var(${UI.COLOR_TEXT_OPACITY_25})`};
    background: ${({ isLoading }) => (isLoading ? 'transparent' : `var(${UI.COLOR_PAPER_DARKER})`)};
    color: ${({ isLoading }) => (isLoading ? `var(${UI.COLOR_TEXT_OPACITY_70})` : `var(${UI.COLOR_TEXT})`)};
  }

  > img {
    width: ${({ iconOnly, iconSize = 24 }) => (iconOnly ? '100%' : `${iconSize}px`)};
    height: ${({ iconOnly, iconSize = 24 }) => (iconOnly ? '100%' : `${iconSize}px`)};
    border-radius: 100%;
  }

  > span {
    padding: 0 4px;
  }

  &:before {
    content: '';
    width: var(--itemSize);
    height: var(--itemSize);
    display: ${({ isLoading }) => (isLoading ? 'block' : 'none')};
    transform: translateX(-100%);
    position: absolute;
    left: 0;
    top: 0;
    ${({ theme, isLoading }) => isLoading && theme.shimmer};
  }
`

export const MenuWrapper = styled.div`
  position: relative;
`

export const MenuListStyled = styled(MenuList)`
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  flex-direction: column;
  gap: 4px;
  position: absolute;
  right: 0;
  top: 40px;
  z-index: 12;
  border-radius: 12px;
  padding: 10px;
  background: var(${UI.COLOR_PAPER});
  box-shadow: var(${UI.BOX_SHADOW});
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  outline: none;
  overflow: hidden;
  min-width: 200px;
`
