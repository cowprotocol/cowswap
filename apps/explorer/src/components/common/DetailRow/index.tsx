import React from 'react'

import styled from 'styled-components/macro'

import ShimmerBar from '../../../explorer/components/common/ShimmerBar'
import { HelpTooltip } from '../../Tooltip'

export interface DetailRowProps {
  label: string
  tooltipText?: React.ReactNode
  children: React.ReactNode
  isLoading?: boolean
  stack?: boolean
}

export function DetailRow({ label, tooltipText, children, isLoading, stack }: DetailRowProps): React.ReactNode {
  return (
    <tr>
      <FirstColumnTh>
        <div>
          {tooltipText && <HelpTooltip tooltip={tooltipText} />} {label}
        </div>
      </FirstColumnTh>
      <td>
        <TdContent $stack={stack}>{isLoading ? <ShimmerBar height={1.6} /> : (children ?? '-')}</TdContent>
      </td>
    </tr>
  )
}

const FirstColumnTh = styled.th`
  width: 0;
  min-width: 120px;

  & > div {
    display: flex;
    flex-direction: row;
    white-space: nowrap;
  }
`

const TdContent = styled.div<{ $stack?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  flex-direction: ${({ $stack }) => ($stack ? 'column' : 'row')};
`
