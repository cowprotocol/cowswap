import { ReactNode } from 'react'

import { Media, UI } from '@cowprotocol/ui'

import ICON_ARROW from 'assets/images/arrow-left.svg'
import ICON_BELL_ALERT from 'assets/images/icon-bell-alert.svg'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { NOTIFICATION_SIDEBAR_Z_INDEX } from '../../constants'

interface IconProps {
  onClick?: () => void
}

const IconButton = styled.button`
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(${UI.COLOR_TEXT_OPACITY_60});

  &:hover {
    background: var(${UI.COLOR_PAPER_DARKER});
    color: var(${UI.COLOR_TEXT});
  }
`

const IconBase = styled(SVG)<{ size?: string; opacity?: string }>`
  --size: 18px;
  width: ${({ size }) => size || 'var(--size)'};
  height: ${({ size }) => size || 'var(--size)'};
  object-fit: contain;
  margin: auto;
  cursor: pointer;
  fill: currentColor;
  transition:
    opacity var(${UI.ANIMATION_DURATION}) ease-in-out,
    background var(${UI.ANIMATION_DURATION}) ease-in-out;
  padding: 8px;
  box-sizing: content-box;

  > path {
    fill: inherit;
  }
`

export const ArrowLeft = ({ onClick }: IconProps): ReactNode => (
  <IconButton onClick={onClick}>
    <IconBase src={ICON_ARROW} size="14px" />
  </IconButton>
)

export const Sidebar = styled.div<{ isOpen: boolean }>`
  --width: 390px;
  position: fixed;
  right: 0;
  top: 10px;
  width: var(--width);
  height: 100vh;
  background: var(${UI.COLOR_PAPER});
  border: ${({ theme }) => (theme.darkMode ? `1px solid var(${UI.COLOR_TEXT_OPACITY_10})` : 'none')};
  padding: 0;
  box-shadow: 0 0 100px var(${UI.COLOR_BLACK_OPACITY_30});
  transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(102%)')};
  transition: transform 0.3s ease-in-out;
  z-index: ${NOTIFICATION_SIDEBAR_Z_INDEX};
  border-top-left-radius: 16px;
  overflow-y: auto;

  ${({ theme }) => theme.colorScrollbar};

  ${Media.upToSmall()} {
    width: 100%;
    position: fixed;
    top: 0;
    border: 0;
    border-radius: 0;
    z-index: ${NOTIFICATION_SIDEBAR_Z_INDEX + 1};
  }
`

export const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  background: var(${UI.COLOR_PAPER});
  position: sticky;
  top: 0;
  padding: 10px;
  margin: 0;
  z-index: 10;

  > h3 {
    font-size: 16px;
    font-weight: var(${UI.FONT_WEIGHT_BOLD});
    margin: 0 auto 0 0;
    line-height: 1;
  }

  > span {
    display: flex;
    align-items: center;
    gap: 0;
    color: var(${UI.COLOR_TEXT});
  }
`

export const NotificationSettingsIcon = styled.button`
  --size: 38px;
  border: none;
  background: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
  width: var(--size);
  height: var(--size);

  &:hover {
    background: var(${UI.COLOR_PAPER_DARKER});
    color: var(${UI.COLOR_TEXT});
  }

  > svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
`

const BellIcon = styled(SVG)`
  width: 16px;
  height: 16px;
  fill: currentColor;
  margin-right: 6px;
`

export const EnableAlertsButton = styled.button`
  background: var(${UI.COLOR_INFO_BG});
  color: var(${UI.COLOR_INFO_TEXT});
  border: none;
  border-radius: 12px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: var(${UI.FONT_WEIGHT_BOLD});
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  transition:
    background-color var(${UI.ANIMATION_DURATION}) ease-in-out,
    color var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    background: var(${UI.COLOR_PRIMARY});
    color: var(${UI.COLOR_BUTTON_TEXT});
  }
`

export const EnableAlertsButtonWithIcon = ({
  onClick,
  ...props
}: IconProps & React.ButtonHTMLAttributes<HTMLButtonElement>): ReactNode => (
  <EnableAlertsButton onClick={onClick} {...props}>
    <BellIcon src={ICON_BELL_ALERT} />
    Enable trade alerts
  </EnableAlertsButton>
)
