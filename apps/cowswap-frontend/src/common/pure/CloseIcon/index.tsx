import { Command } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'

import CLOSE_ICON from 'assets/icon/x.svg'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

const IconX = styled.div`
  cursor: pointer;
  opacity: 0.7;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  margin: 0;

  > svg {
    width: var(${UI.ICON_SIZE_NORMAL});
    height: var(${UI.ICON_SIZE_NORMAL});
    color: var(${UI.ICON_COLOR_NORMAL});
  }

  &:hover {
    opacity: 1;
  }
`

export interface CloseIconProps {
  onClick: Command
  className?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CloseIcon({ onClick, className }: CloseIconProps) {
  return (
    <IconX onClick={onClick} className={className}>
      <SVG src={CLOSE_ICON} />
    </IconX>
  )
}
