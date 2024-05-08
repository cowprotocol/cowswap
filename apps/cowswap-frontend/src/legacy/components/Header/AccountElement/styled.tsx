import { UI } from '@cowprotocol/ui'

import { Text } from 'rebass'
import styled from 'styled-components/macro'

export const BalanceText = styled(Text)`
  font-weight: 500;
  font-size: 13px;
  padding: 0 9px 0 11px;
  min-width: initial;
  color: var(${UI.COLOR_TEXT_OPACITY_70});

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    overflow: hidden;
    max-width: 100px;
    text-overflow: ellipsis;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

export const Wrapper = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  white-space: nowrap;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg1)};
  border-radius: 21px;
  border: 2px solid transparent;
  transition: border var(${UI.ANIMATION_DURATION}) ease-in-out;
  pointer-events: auto;
  width: auto;

  /* :focus {
    border: 1px solid blue;
  } */

  /* &:hover {
    border: 2px solid var(${UI.COLOR_TEXT_OPACITY_25});
  } */

  ${({ theme }) => theme.mediaWidth.upToMedium`
    height: 100%;
  `}

  ${({ theme }) =>
    theme.isInjectedWidgetMode &&
    `
    background-color: transparent;
    margin: 0 20px 0 auto!important;
    border: 0!important;
  `}
`

export const NotificationBell = styled.div<{ hasNotification?: boolean }>`
  --size: 18px;
  width: var(--size);
  height: var(--size);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: auto 10px auto 8px;
  position: relative;

  &::after {
    content: '';
    --size: 8px;
    border: 2px solid var(${UI.COLOR_PAPER});
    box-sizing: content-box;
    position: absolute;
    top: -3px;
    right: -4px;
    width: var(--size);
    height: var(--size);
    border-radius: var(--size);
    transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
    background: ${({ hasNotification = true }) => (hasNotification ? `var(${UI.COLOR_DANGER})` : 'inherit')};
  }

  > svg {
    width: var(--size);
    height: var(--size);
    object-fit: contain;
    color: var(${UI.COLOR_TEXT_OPACITY_50});
    transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;

    > path {
      fill: currentColor;
    }

    &:hover {
      color: var(${UI.COLOR_TEXT});

      &::after {
        opacity: 1;
      }
    }
  }
`

export const Sidebar = styled.div<{ isOpen: boolean }>`
  --width: 390px;
  position: fixed;
  right: 0;
  top: 16px;
  width: var(--width);
  height: 100vh;
  background: var(${UI.COLOR_PAPER});
  border-left: 2px solid var(${UI.COLOR_PAPER_DARKEST});
  border-top: 2px solid var(${UI.COLOR_PAPER_DARKEST});
  padding: 0;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.12);
  transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(100%)')};
  transition: transform 0.3s ease-in-out;
  z-index: 10000;
  border-top-left-radius: 16px;
  overflow-y: auto;
`

export const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: var(${UI.COLOR_PAPER});
  position: sticky;
  top: 0;
  padding: 20px;
  margin: 0;
  z-index: 10;

  > h3 {
    font-size: 16px;
    margin: 0;
    line-height: 1;
  }

  > span {
    display: flex;
    align-items: center;
    gap: 16px;
    color: var(${UI.COLOR_TEXT});
  }

  > span > svg {
    --size: 17px;
    width: var(--size);
    height: var(--size);
    object-fit: contain;
    margin: auto;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  }

  > span > svg:hover {
    opacity: 1;
  }
`

export const NotificationList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 20px;

  > h4 {
    font-size: 13px;
    font-weight: 500;
    margin: 0 0 16px;
    opacity: 0.7;
  }

  > div {
    display: flex;
    flex-flow: column wrap;
    gap: 16px;
    margin: 0 0 50px;
  }
`

export const NotificationCard = styled.div`
  --imageSize: 42px;
  display: grid;
  grid-template-columns:
    var(--imageSize)
    1fr;
  background: var(${UI.COLOR_PAPER_DARKER});
  margin: 0;
  padding: 16px;
  border-radius: 12px;
  gap: 16px;
  color: var(${UI.COLOR_TEXT});

  > img {
    width: var(--imageSize);
    height: var(--imageSize);
    border-radius: var(--imageSize);
    object-fit: contain;
  }

  > span {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    gap: 10px;
  }

  > span > strong {
    font-size: 15px;
    font-weight: 600;
    color: inherit;
  }

  > span > p {
    font-size: 13px;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
    margin: 0;
  }
`
