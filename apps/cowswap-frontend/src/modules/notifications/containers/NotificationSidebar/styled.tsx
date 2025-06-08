import ICON_ARROW from '@cowprotocol/assets/images/arrow-left.svg'
import ICON_DOUBLE_ARROW_RIGHT from '@cowprotocol/assets/images/double-arrow-right.svg'
import ICON_CLOSE_X from '@cowprotocol/assets/images/x.svg'
import { Media, UI } from '@cowprotocol/ui'

import { Settings } from 'react-feather'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

interface IconProps {
  onClick?: () => void
}

const IconBase = styled(SVG)<{ size?: string; opacity?: string }>`
  width: ${({ size }) => size || '18px'};
  height: ${({ size }) => size || '18px'};
  object-fit: contain;
  margin: auto;
  cursor: pointer;
  opacity: ${({ opacity }) => opacity || 0.5};
  fill: currentColor;
  transition:
    opacity var(${UI.ANIMATION_DURATION}) ease-in-out,
    background var(${UI.ANIMATION_DURATION}) ease-in-out;
  padding: 8px;
  box-sizing: content-box;
  border-radius: ${({ size }) => size || '18px'};

  &:hover {
    opacity: 1;
    background: var(${UI.COLOR_PAPER_DARKER});
  }

  > path {
    fill: inherit;
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const DoubleArrowRightIcon = ({ onClick }: IconProps) => (
  <IconBase src={ICON_DOUBLE_ARROW_RIGHT} onClick={onClick} />
)

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const CloseIcon = ({ onClick }: IconProps) => <IconBase src={ICON_CLOSE_X} onClick={onClick} />

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const ArrowLeft = ({ onClick }: IconProps) => (
  <IconBase src={ICON_ARROW} onClick={onClick} size="14px" opacity="1" />
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

  ${({ theme }) => theme.colorScrollbar};

  ${Media.upToSmall()} {
    width: 100%;
    position: fixed;
    top: 0;
    border: 0;
    border-radius: 0;
  }
`

interface SidebarHeaderProps {
  isArrowNav?: boolean
}

export const SidebarHeader = styled.div<SidebarHeaderProps>`
  display: flex;
  align-items: center;
  justify-content: ${({ isArrowNav }) => (isArrowNav ? 'flex-start' : 'space-between')};
  gap: ${({ isArrowNav }) => (isArrowNav ? '21px' : '10px')};
  width: 100%;
  background: var(${UI.COLOR_PAPER});
  position: sticky;
  top: 0;
  padding: 10px 16px 6px 8px;
  margin: 0;
  z-index: 10;

  ${Media.upToSmall()} {
    flex-flow: row-reverse;
    flex-flow: ${({ isArrowNav }) => (isArrowNav ? 'row' : 'row-reverse')};
    padding: 16px;
  }

  > h3 {
    font-size: 18px;
    font-weight: var(${UI.FONT_WEIGHT_BOLD});
    margin: 0;
    line-height: 1;
  }

  > span {
    display: flex;
    align-items: center;
    gap: 0;
    color: var(${UI.COLOR_TEXT});

    ${Media.upToSmall()} {
      flex-flow: ${({ isArrowNav }) => (isArrowNav ? 'row' : 'row-reverse')};
    }
  }
`

export const SettingsIcon = styled(Settings)`
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
`
