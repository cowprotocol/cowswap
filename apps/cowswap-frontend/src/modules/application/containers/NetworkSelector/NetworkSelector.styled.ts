import Close from '@cowprotocol/assets/images/x.svg?react'
import { UI } from '@cowprotocol/ui'
import { Media } from '@cowprotocol/ui'

import { darken, transparentize } from 'color2k'
import { AlertTriangle, ChevronDown } from 'react-feather'
import styled from 'styled-components/macro'

export const FlyoutHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
  width: 100%;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  color: inherit;
  font-weight: 400;
  background-color: var(${UI.COLOR_PAPER});
`

export const CloseIcon = styled(Close)`
  display: none;

  ${Media.upToMedium()} {
    --size: 16px;
    display: block;
    opacity: 0.6;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
    stroke: var(${UI.COLOR_TEXT});
    width: var(--size);
    height: var(--size);
    object-fit: contain;

    &:hover {
      opacity: 1;
    }
  }
`

export const FlyoutMenu = styled.div`
  ${Media.MediumAndUp()} {
    position: absolute;
    width: 272px;
    z-index: 99;
    padding-top: 10px;
    top: 38px;
    right: 0;
  }
`

export const FlyoutMenuContents = styled.div`
  display: flex;
  overflow: hidden;
  background-color: var(${UI.COLOR_PAPER});
  border: 1px solid var(${UI.COLOR_PAPER_DARKEST});
  box-shadow: var(${UI.BOX_SHADOW});
  border-radius: 12px;
  font-size: 16px;
  min-width: 175px;
  z-index: 99;
  max-height: calc(100dvh - 66px - 32px);

  ${Media.upToMedium()} {
    bottom: 56px;
    left: 0;
    position: fixed;
    width: 100%;
    border-radius: 12px 12px 0 0;
    box-shadow: 0 -100vh 0 100vh ${transparentize('black', 0.4)};
    max-height: calc(100dvh - 56px) !important;
  }
`

export const FlyoutMenuScrollable = styled.div`
  overflow: auto;
  width: 100%;

  ${({ theme }) => theme.colorScrollbar};
`

export const FlayoutMenuList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  padding: 0 16px 16px;
`

export const SelectorLabel = styled.div`
  display: block;
  flex: 1 1 auto;
  margin: 0;
  white-space: nowrap;

  ${Media.upToExtraSmall()} {
    display: none;
  }
`
export const SelectorControls = styled.div<{ isChainIdUnsupported: boolean }>`
  align-items: center;
  color: inherit;
  display: flex;
  font-weight: 400;
  justify-content: space-between;
  gap: 6px;
  border-radius: 28px;
  border: 2px solid transparent;
  padding: 6px;
  transition: border var(${UI.ANIMATION_DURATION}) ease-in-out;
  background: transparent;

  &:focus {
    background-color: ${({ theme }) => darken(theme.error, 0.1)};
  }

  &:hover {
    border: 2px solid ${({ theme }) => transparentize(theme.text, 0.7)};
  }

  ${({ isChainIdUnsupported, theme }) =>
    isChainIdUnsupported &&
    `
      color: ${theme.danger}!important;
      background: ${transparentize(theme.danger, 0.85)}!important;
      border: 2px solid ${transparentize(theme.danger, 0.5)}!important;
    `}
`
export const SelectorLogo = styled.img<{ interactive?: boolean }>`
  --size: 24px;
  width: var(--size);
  height: var(--size);
  margin-right: ${({ interactive }) => (interactive ? 8 : 0)}px;
  object-fit: contain;

  ${Media.upToExtraSmall()} {
    --size: 21px;
  }
`
export const SelectorWrapper = styled.div`
  display: flex;
  cursor: pointer;
  height: 100%;

  ${Media.MediumAndUp()} {
    position: relative;
  }
`
export const StyledChevronDown = styled(ChevronDown)`
  width: 21px;
  height: 21px;
  margin: 0 0 0 -3px;
  object-fit: contain;
`
export const NetworkIcon = styled(AlertTriangle)`
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  width: 16px;
  height: 16px;
`
export const NetworkAlertLabel = styled.div`
  flex: 1 1 auto;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.4rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;

  ${Media.upToExtraSmall()} {
    > span {
      display: none;
    }
  }
`
