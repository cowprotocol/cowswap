import { Info } from 'react-feather'
import { MouseoverTooltipContent, TooltipContainer } from 'components/Tooltip'
import styled from 'styled-components/macro'
import { ReactNode } from 'react'

const StyledInfoIcon = styled(Info)`
  opacity: 0.4;
  stroke: ${({ theme }) => theme.text3};
  line-height: 0;
  vertical-align: middle;

  :hover {
    opacity: 1;
  }
`

const StyledTooltipContainer = styled(TooltipContainer)`
  font-size: 13px;
`

export interface InfoIconProps {
  content: ReactNode
}

export function InfoIcon(props: InfoIconProps) {
  const content = <StyledTooltipContainer>{props.content}</StyledTooltipContainer>

  return (
    <MouseoverTooltipContent wrap={false} content={content} placement="bottom">
      <StyledInfoIcon size={16} />
    </MouseoverTooltipContent>
  )
}
