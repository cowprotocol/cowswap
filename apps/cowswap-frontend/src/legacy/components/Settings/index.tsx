import { Command } from '@cowprotocol/types'
import { RowFixed, UI } from '@cowprotocol/ui'
import { Percent } from '@uniswap/sdk-core'

import { transparentize } from 'color2k'
import styled from 'styled-components/macro'
import { WithClassName } from 'types'

import SettingsMod, { EmojiWrapper, MenuFlyout, StyledMenuButton, StyledMenuIcon } from './SettingsMod'

const Settings = styled(SettingsMod)`
  ${MenuFlyout} {
    box-shadow: ${({ theme }) => theme.boxShadow2};
    border: 1px solid ${({ theme }) => transparentize(theme.white, 0.95)};
    background-color: var(${UI.COLOR_PAPER});
    color: inherit;
    padding: 0;
    margin: 0;
    top: 36px;
    right: 0;
    width: 280px;
  }

  ${RowFixed} {
    color: inherit;

    > div {
      color: inherit;
      opacity: 0.85;
    }
  }

  ${StyledMenuButton} {
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
    border: none;
    background-color: transparent;
    margin: 0;
    padding: 0;
    color: inherit;

    &:hover,
    &:focus {
      cursor: pointer;
      outline: none;
      color: currentColor;
    }

    svg {
      opacity: 1;
      margin: 0;
      transition: transform 0.3s cubic-bezier(0.65, 0.05, 0.36, 1);
      color: inherit;
    }

    &:hover > svg {
      transform: rotate(180deg);
    }

    &:hover svg > path,
    &:hover svg > circle {
      stroke: currentColor;
    }
  }

  ${StyledMenuIcon} {
    --size: var(${UI.ICON_SIZE_NORMAL});
    height: var(--size);
    width: var(--size);
    color: inherit;
    opacity: 0.6;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

    &:hover {
      opacity: 1;
    }

    > path,
    > circle {
      transition: stroke var(${UI.ANIMATION_DURATION}) ease-in-out;
      stroke: currentColor;
    }
  }

  ${EmojiWrapper} {
    position: relative;
    margin: 0 0 0 6px;
    animation: expertModeOn 3s normal forwards ease-in-out;

    span {
      font-size: var(${UI.ICON_SIZE_NORMAL});

      &::after {
        content: '🐮';
        font-size: inherit;
        position: absolute;
        top: -13px;
        right: 0;
        left: 0;
        margin: 0 auto;
      }
    }
  }

  @keyframes expertModeOn {
    0% {
      filter: none;
    }
    15% {
      filter: sepia(1);
    }
    30% {
      filter: sepia(0);
    }
    45% {
      filter: sepia(1);
    }
    60% {
      filter: sepia(0);
    }
    75% {
      filter: sepia(1);
    }
    100% {
      filter: sepia(0);
    }
  }
`

export interface SettingsButtonProps {
  toggleSettings: Command
}

export interface SettingsTabProp extends WithClassName {
  SettingsButton: React.FC<SettingsButtonProps>
  placeholderSlippage: Percent
}

function SettingsButton({ toggleSettings }: SettingsButtonProps) {
  return (
    <StyledMenuButton onClick={toggleSettings} id="open-settings-dialog-button">
      <StyledMenuIcon />
    </StyledMenuButton>
  )
}

export default function SettingsTab(props: Omit<SettingsTabProp, 'SettingsButton'>) {
  return <Settings {...props} SettingsButton={SettingsButton} />
}
