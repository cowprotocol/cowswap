import React from 'react'
import styled from 'styled-components'

interface BadgeProps {
  checked: boolean
  onChange: () => void
  label: string
  count: number
}

const Wrapper = styled.div<{ checked: boolean }>`
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  background-color: ${({ checked }) => (checked ? '#007bff' : '#e0e0e0')};
  color: ${({ checked }) => (checked ? '#fff' : '#000')};
  cursor: pointer;
  user-select: none;
  font-size: 11px;
`

const Label = styled.span`
  margin-right: 10px;
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
