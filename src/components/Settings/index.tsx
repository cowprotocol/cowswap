import { WithClassName } from 'types'

import styled from 'styled-components/macro'
import { transparentize } from 'polished'
import { RowFixed } from 'components/Row'
import SettingsMod, { StyledMenuButton, MenuFlyout, StyledMenuIcon, EmojiWrapper } from './SettingsMod'
import { Percent } from '@uniswap/sdk-core'

const Settings = styled(SettingsMod)`
  ${MenuFlyout} {
    box-shadow: ${({ theme }) => theme.boxShadow2};
    border: 1px solid ${({ theme }) => transparentize(0.95, theme.white)};
    background-color: ${({ theme }) => theme.bg1};
    color: ${({ theme }) => theme.text1};
    padding: 0;
    margin: 0;
    top: 36px;
    right: 0;
    width: 280px;
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
    border: none;
    background-color: transparent;
    margin: 0;
    padding: 0;

    &:hover,
    &:focus {
      cursor: pointer;
      outline: none;
      color: ${({ theme }) => theme.text1};
    }

    svg {
      opacity: 1;
      margin: 0;
      transition: transform 0.3s cubic-bezier(0.65, 0.05, 0.36, 1);
    }

    &:hover > svg {
      transform: rotate(180deg);
    }

    &:hover svg > path,
    &:hover svg > circle {
      stroke: ${({ theme }) => theme.text1};
    }
  }

  ${StyledMenuIcon} {
    height: 20px;
    width: 20px;

    > path,
    > circle {
      stroke: ${({ theme }) => transparentize(0.3, theme.text1)};
      transition: stroke 0.3s ease-in-out;
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
  placeholderSlippage: Percent
}

function SettingsButton({ toggleSettings, expertMode }: SettingsButtonProps) {
  return (
    <StyledMenuButton onClick={toggleSettings} id="open-settings-dialog-button">
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

export default function SettingsTab(props: Omit<SettingsTabProp, 'SettingsButton'>) {
  return <Settings {...props} SettingsButton={SettingsButton} />
}
