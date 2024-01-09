import React from 'react'
import { Placement } from '@popperjs/core'
import styled from 'styled-components'

import { Tooltip } from 'components/Tooltip'
import { usePopperDefault } from 'hooks/usePopper'

const Wrapper = styled.div`
  > span {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
  }
`
interface TextTooltipProps {
  children: React.ReactNode
  textInTooltip: string | React.ReactNode
  tooltipPlacement?: Placement
}

export const TextWithTooltip: React.FC<TextTooltipProps> = ({
  children,
  textInTooltip,
  tooltipPlacement = 'top',
}): JSX.Element => {
  const { tooltipProps, targetProps } = usePopperDefault<HTMLInputElement>(tooltipPlacement)
  return (
    <Wrapper>
      <Tooltip {...tooltipProps}>{textInTooltip}</Tooltip>
      <span className="span-inside-tooltip" {...targetProps}>
        {children}
      </span>
    </Wrapper>
  )
}
