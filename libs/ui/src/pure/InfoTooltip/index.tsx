import { ReactNode } from 'react'

import { Info } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from '../../enum'
import { HoverTooltip, TooltipContainer } from '../Tooltip'

const StyledIcon = styled.div`
  display: inline-block;
  color: inherit;

  > svg {
    opacity: 0.6;
    stroke: currentColor;
    line-height: 0;
    vertical-align: middle;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

    :hover {
      opacity: 1;
    }
  }
`

const StyledTooltipContainer = styled(TooltipContainer)`
  font-size: 13px;
  border: 0;
  box-shadow: none;
  background: transparent;
`

export interface InfoTooltipProps {
  content: ReactNode
  className?: string
}

export function InfoTooltip({ content, className }: InfoTooltipProps) {
  const tooltipContent = <StyledTooltipContainer>{content}</StyledTooltipContainer>

  return (
    <HoverTooltip wrapInContainer={false} content={tooltipContent} placement="bottom">
      <StyledIcon>
        <Info className={className} size={16} />
      </StyledIcon>
    </HoverTooltip>
  )
}
