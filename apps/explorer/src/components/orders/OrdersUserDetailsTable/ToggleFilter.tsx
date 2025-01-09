import React from 'react'

import styled from 'styled-components/macro'

import { MEDIA } from '../../../const'

interface BadgeProps {
  checked: boolean
  onChange: () => void
  label: string
  count: number
}

const Wrapper = styled.div<{ checked: boolean }>`
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  cursor: pointer;
  color: ${({ checked, theme }): string => (checked ? theme.textActive1 : theme.white)};
  height: 3rem;
  border: 1px solid ${({ theme }): string => theme.borderPrimary};
  border-radius: 0.5rem;
  background: ${({ theme }): string => theme.bg2};

  &media ${MEDIA.mediumUp} {
    &:hover {
      transition: all 0.2s ease-in-out;
      color: ${({ theme }): string => theme.textActive1};
    }
  }

  @media ${MEDIA.mediumDown} {
    min-width: 3rem;
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
