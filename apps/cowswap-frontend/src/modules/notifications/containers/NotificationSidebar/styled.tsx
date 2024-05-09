import { UI } from '@cowprotocol/ui'
import SVG from 'react-inlinesvg'
import ICON_SETTINGS from '@cowprotocol/assets/images/settings.svg'
import ICON_DOUBLE_ARROW_RIGHT from '@cowprotocol/assets/images/double-arrow-right.svg'

import styled from 'styled-components/macro'

interface IconProps {
  onClick?: () => void
}

const IconBase = styled(SVG)`
  --size: 18px;
  width: var(--size);
  height: var(--size);
  object-fit: contain;
  margin: auto;
  cursor: pointer;
  opacity: 0.5;
  fill: currentColor;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }

  > path {
    fill: currentColor;
  }
`

export const SettingsIcon = ({ onClick }: IconProps) => <IconBase src={ICON_SETTINGS} onClick={onClick} />

export const DoubleArrowRightIcon = ({ onClick }: IconProps) => (
  <IconBase src={ICON_DOUBLE_ARROW_RIGHT} onClick={onClick} />
)

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
  transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(102%)')};
  transition: transform 0.3s ease-in-out;
  z-index: 10000;
  border-top-left-radius: 16px;
  overflow-y: auto;
`

export const SidebarHeader = styled.div<{ alignLeft?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ alignLeft }) => (alignLeft ? 'flex-start' : 'space-between')};
  gap: 10px;
  width: 100%;
  background: var(${UI.COLOR_PAPER});
  position: sticky;
  top: 0;
  padding: 20px;
  margin: 0;
  z-index: 10;

  > h3 {
    font-size: 16px;
    font-weight: var(${UI.FONT_WEIGHT_BOLD});
    margin: 0;
    line-height: 1;
  }

  > span {
    display: flex;
    align-items: center;
    gap: 16px;
    color: var(${UI.COLOR_TEXT});
  }
`
