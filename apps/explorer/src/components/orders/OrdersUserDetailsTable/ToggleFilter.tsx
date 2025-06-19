import React from 'react'

import { Color } from '@cowprotocol/ui'

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
  padding: 0 0.8rem;
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  cursor: pointer;
  color: ${({ checked }): string => (checked ? Color.explorer_textActive : Color.neutral100)};
  height: 3rem;
  border: 0.1rem solid ${Color.explorer_border};
  border-radius: 0.5rem;
  background: ${Color.explorer_bg2};

  &media ${MEDIA.mediumUp} {
    &:hover {
      transition: all 0.2s ease-in-out;
      color: ${Color.explorer_textActive};
    }
  }

  @media ${MEDIA.mediumDown} {
    min-width: 3rem;
  }
`

const Label = styled.span`
  margin-right: 0.8rem;
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
