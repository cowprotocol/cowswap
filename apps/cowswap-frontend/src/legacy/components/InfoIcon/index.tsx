import { ReactNode } from 'react'

import { MouseoverTooltipContent, TooltipContainer } from '@cowprotocol/ui'

import { Info, HelpCircle } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

const StyledIcon = styled.div`
  display: inline-block;

  > svg {
    opacity: 0.5;
    stroke: var(${UI.COLOR_TEXT1});
    line-height: 0;
    vertical-align: middle;
    transition: opacity 0.2s ease-in-out;

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

export interface InfoIconProps {
  content: ReactNode
  iconType?: 'info' | 'help'
  className?: string
}

export function InfoIcon({ content, iconType = 'info', className }: InfoIconProps) {
  const tooltipContent = <StyledTooltipContainer>{content}</StyledTooltipContainer>

  return (
    <MouseoverTooltipContent wrap={false} content={tooltipContent} placement="bottom">
      <StyledIcon>
        {iconType === 'info' ? (
          <Info className={className} size={16} />
        ) : (
          <HelpCircle className={className} size={16} />
        )}
      </StyledIcon>
    </MouseoverTooltipContent>
  )
}
