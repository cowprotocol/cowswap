import type { ReactNode } from 'react'

import { Color } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { LayoutMode } from './types'

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  background: ${Color.explorer_bg};
  border: 1px solid ${Color.explorer_border};
  border-radius: 8px;
  padding: 0.18rem;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
`

const Button = styled.button<{ $active: boolean }>`
  appearance: none;
  border: none;
  background: ${({ $active }): string =>
    $active ? `linear-gradient(180deg, ${Color.explorer_orange1} 0%, #d67b4d 100%)` : 'transparent'};
  color: ${({ $active }): string => ($active ? Color.neutral100 : Color.explorer_textSecondary)};
  border-radius: 6px;
  padding: 0.32rem 0.78rem;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.16s ease-in-out;

  &:hover:not([disabled]) {
    background: ${({ $active }): string =>
      $active ? `linear-gradient(180deg, ${Color.explorer_orange1} 0%, #d67b4d 100%)` : Color.explorer_bgButtonHover};
    color: ${Color.neutral100};
  }
`

type LayoutModeToggleProps = {
  value: LayoutMode
  onChange: (mode: LayoutMode) => void
}

export function LayoutModeToggle({ value, onChange }: LayoutModeToggleProps): ReactNode {
  return (
    <Wrapper>
      <Button $active={value === LayoutMode.COMPACT} onClick={(): void => onChange(LayoutMode.COMPACT)} type="button">
        Sankey
      </Button>
      <Button $active={value === LayoutMode.GRAPH} onClick={(): void => onChange(LayoutMode.GRAPH)} type="button">
        Legacy
      </Button>
    </Wrapper>
  )
}
