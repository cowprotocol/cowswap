import { ReactNode } from 'react'

import DropDown from '@cowprotocol/assets/images/dropdown.svg'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { UI } from '../../enum'

enum ArrowDirection {
  Right = 'right',
  Down = 'down',
  Left = 'left',
  Up = 'up',
}

const ROTATION_MAP: Record<ArrowDirection, string> = {
  [ArrowDirection.Right]: 'rotate(-90deg)',
  [ArrowDirection.Down]: 'rotate(0deg)',
  [ArrowDirection.Left]: 'rotate(90deg)',
  [ArrowDirection.Up]: 'rotate(180deg)',
}

const StyledArrowIcon = styled(SVG)<{
  $size: number
  $color: string
  $strokeWidth: number
  $direction: ArrowDirection
  $verticalCenter: boolean
}>`
  --size: ${({ $size }) => $size}px;
  width: var(--size);
  height: var(--size);
  color: ${({ $color }) => $color};
  transform: ${({ $direction }) => ROTATION_MAP[$direction] || ROTATION_MAP[ArrowDirection.Right]};
  transition: opacity 0.2s ease-out;
  ${({ $verticalCenter }) =>
    $verticalCenter &&
    `
    margin: auto 0;
  `}

  > path {
    stroke-width: ${({ $strokeWidth }) => $strokeWidth}px;
  }
`

export interface ArrowIconProps {
  direction?: ArrowDirection
  size?: number
  color?: string
  strokeWidth?: number
  className?: string
  verticalCenter?: boolean
}

export function ArrowIcon({
  direction = ArrowDirection.Right,
  size = 18,
  color = `var(${UI.COLOR_TEXT_OPACITY_50})`,
  strokeWidth = 1.2,
  className,
  verticalCenter = false,
}: ArrowIconProps): ReactNode {
  return (
    <StyledArrowIcon
      src={DropDown}
      className={className}
      $size={size}
      $color={color}
      $strokeWidth={strokeWidth}
      $direction={direction}
      $verticalCenter={verticalCenter}
    />
  )
}
