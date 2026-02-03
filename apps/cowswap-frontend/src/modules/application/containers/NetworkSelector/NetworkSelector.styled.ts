import { Media, UI } from '@cowprotocol/ui'

import { darken, transparentize } from 'color2k'
import { AlertTriangle, ChevronDown, X } from 'react-feather'
import styled from 'styled-components/macro'

import { TAP_DESKTOP, TAP_MOBILE } from 'common/pure/NetworksList/NetworksList.const'

const CLOSE_ICON_SIZE = '24px'

export const FlyoutHeader = styled.div`
  color: inherit;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
  margin: 0 0 10px;
`

export const FlyoutHeaderTitle = styled.div`
  flex: 1 1 auto;
  font-size: 16px;
  font-weight: 500;
  margin: 0;

  ${Media.upToMedium()} {
    font-size: 18px;
  }
`

export const CloseButton = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  display: none;
  justify-content: center;
  min-height: ${TAP_DESKTOP};
  min-width: auto;
  object-fit: contain;
  opacity: 0.7;
  padding: 0;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  ${Media.upToMedium()} {
    display: inline-flex;
    min-height: ${TAP_MOBILE};
    min-width: auto;
  }

  &:hover {
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_PRIMARY});
    outline-offset: 2px;
    border-radius: 6px;
  }
`

export const CloseIcon = styled(X)`
  --size: ${CLOSE_ICON_SIZE};
  width: var(--size);
  height: var(--size);

  > line {
    stroke: var(${UI.COLOR_TEXT});
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

export const FlyoutMenuContents = styled.div.attrs(() => ({
  role: 'dialog',
  'aria-modal': true,
}))`
  align-items: flex-start;
  background-color: var(${UI.COLOR_PAPER});
  border: 1px solid var(${UI.COLOR_PAPER_DARKEST});
  box-shadow: var(${UI.BOX_SHADOW});
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  overflow: auto;
  min-width: 175px;
  z-index: 99;
  overflow: hidden;
  max-height: calc(100dvh - 66px - 32px);

  ${Media.upToMedium()} {
    bottom: 56px;
    left: 0;
    position: fixed;
    width: 100%;
    border-radius: 12px 12px 0 0;
    box-shadow: 0 -100vh 0 100vh ${transparentize('black', 0.4)};
    max-height: calc(100dvh - 56px);
  }

  & > *:not(:last-child) {
    margin-bottom: 5px;
  }
`

export const FlyoutMenuScrollable = styled.div`
  overflow: auto;
  width: 100%;
  padding: 16px;
  ${({ theme }) => theme.colorScrollbar};

  ${Media.upToMedium()} {
    padding: 16px 16px 100px;
  }
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
export const SelectorControls = styled.div<{ isChainIdUnsupported: boolean; isOpen: boolean }>`
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

  ${({ isOpen }) =>
    isOpen &&
    `
      background: var(${UI.COLOR_PAPER_DARKER});
      border: 2px solid var(${UI.COLOR_PAPER_DARKEST});
    `}

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
export const StyledChevronDown = styled(ChevronDown)<{ isOpen: boolean }>`
  width: 21px;
  height: 21px;
  margin: 0 0 0 -3px;
  object-fit: contain;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform var(${UI.ANIMATION_DURATION}) ease-in-out;
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
