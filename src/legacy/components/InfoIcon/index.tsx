import { ReactNode } from 'react'

import { Info } from 'react-feather'
import styled from 'styled-components/macro'

import { MouseoverTooltipContent, TooltipContainer } from 'legacy/components/Tooltip'

const StyledInfoIcon = styled(Info)`
  opacity: 0.5;
  stroke: ${({ theme }) => theme.text1};
  line-height: 0;
  vertical-align: middle;
  transition: opacity 0.2s ease-in-out;

  :hover {
    opacity: 1;
  }
`

const StyledTooltipContainer = styled(TooltipContainer)`
  font-size: 13px;
  border: 0;
  box-shadow: none;
  background: transparent;
`

export interface InfoIconProps {
  content: ReactNode
  className?: string
}

export function InfoIcon(props: InfoIconProps) {
  const content = <StyledTooltipContainer>{props.content}</StyledTooltipContainer>

  return (
    <MouseoverTooltipContent wrap={false} content={content} placement="bottom">
      <StyledInfoIcon className={props.className} size={16} />
    </MouseoverTooltipContent>
  )
}
