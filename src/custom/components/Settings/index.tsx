import { WithClassName } from 'types'
import React from 'react'
import styled from 'styled-components'
import { RowFixed } from 'components/Row'
import SettingsMod, { StyledMenuButton, MenuFlyout, StyledMenuIcon, EmojiWrapper } from './SettingsMod'

const Wrapper = styled(SettingsMod)`
  ${MenuFlyout} {
    box-shadow: 0px 0px 0px rgb(0 0 0 / 1%), 0px 4px 8px rgb(0 0 0 / 0%), 0px 16px 24px rgb(0 0 0 / 60%),
      0px 24px 32px rgb(0 0 0 / 20%);
    background-color: ${({ theme }) => theme.bg5};
    color: ${({ theme }) => theme.text1};
  }

  ${RowFixed} {
    > div {
      color: ${({ theme }) => theme.text1};
      opacity: 0.85;
    }
  }

  ${StyledMenuButton} {
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
    height: 100%;
    border: none;
    background-color: transparent;
    margin: 0;
    padding: 0;
    height: 35px;
    padding: 0;
    border-radius: 35px;
    color: ${({ theme }) => theme.text1};

    &:hover,
    &:focus {
      cursor: pointer;
      outline: none;
    }

    > b {
      margin: 0 4px 0 0;
    }

    svg {
      opacity: 1;
      margin: 2px 0 0;
      transition: transform 0.3s cubic-bezier(0.65, 0.05, 0.36, 1);
    }

    &:hover > svg {
      transform: rotate(180deg);
    }
  }

  ${StyledMenuIcon} {
    height: 20px;
    width: 20px;
    > * {
      stroke: ${({ theme }) => theme.text1};
    }
  }

  ${EmojiWrapper} {
    position: relative;
    margin: 0 0 0 6px;
    animation: expertModeOn 3s normal forwards ease-in-out;

    span {
      font-size: 20px;

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
  toggleSettings: () => void
  expertMode: boolean
}

export interface SettingsTabProp extends WithClassName {
  SettingsButton: React.FC<SettingsButtonProps>
}

function SettingsButton({ toggleSettings, expertMode }: SettingsButtonProps) {
  return (
    <StyledMenuButton onClick={toggleSettings} id="open-settings-dialog-button">
      <b>Settings</b>
      <StyledMenuIcon />
      {expertMode ? (
        <EmojiWrapper>
          <span role="img" aria-label="Expert Mode Turned On">
            🥋
          </span>
        </EmojiWrapper>
      ) : null}
    </StyledMenuButton>
  )
}

export default function SettingsTab() {
  return <Wrapper SettingsButton={SettingsButton} />
}
