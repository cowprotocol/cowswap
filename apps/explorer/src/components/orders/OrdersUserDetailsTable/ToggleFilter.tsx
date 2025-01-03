import React from 'react'

import { FloatingButton } from 'explorer/components/TransanctionBatchGraph/styled'
import styled from 'styled-components/macro'

interface BadgeProps {
  checked: boolean
  onChange: () => void
  label: string
  count: number
}

const Wrapper = styled.div<{ checked: boolean }>`
  ${FloatingButton} {
    display: flex;
    align-items: center;
    padding: 0 8px;
    font-size: ${({ theme }): string => theme.fontSizeDefault};
  }
`

const Label = styled.span`
  margin-right: 8px;
`

const Count = styled.span`
  font-weight: bold;
`

export const ToggleFilter: React.FC<BadgeProps> = ({ checked, onChange, label, count }) => {
  return (
    <Wrapper checked={checked} onClick={onChange}>
      <Label>{label}</Label>
      <Count>{count}</Count>
    </Wrapper>
  )
}
