import { ReactNode } from 'react'

import { Info } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from '../../enum'
import { HoverTooltip, TooltipContainer } from '../Tooltip'

const StyledIcon = styled.div<{ size: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  height: ${({ size }) => size}px;

  &:hover {
    opacity: 1;
  }

  > span {
    margin-right: 4px;
  }

  > svg {
    stroke: currentColor;
    line-height: 0;
    vertical-align: middle;
  }
`

const StyledTooltipContainer = styled(TooltipContainer)`
  font-size: 13px;
  border: 0;
  box-shadow: none;
  background: transparent;

  > p {
    margin: 0;
  }
`

export interface InfoTooltipProps {
  // @deprecated use children instead
  content?: ReactNode
  children?: ReactNode
  size?: number
  className?: string
  preText?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function InfoTooltip({ content, children, className, size = 16, preText }: InfoTooltipProps) {
  const tooltipContent = <StyledTooltipContainer>{children || content}</StyledTooltipContainer>

  return (
    <HoverTooltip wrapInContainer={false} content={tooltipContent} placement="bottom">
      <StyledIcon size={size}>
        {preText && <span>{preText}</span>}
        <Info className={className} size={size} />
      </StyledIcon>
    </HoverTooltip>
  )
}
