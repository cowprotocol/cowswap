import { Collapsible, font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ToggleRow = styled(Collapsible.Trigger)`
  --collapsible-trigger-hover-background: transparent;
  --collapsible-trigger-open-hover-background: transparent;

  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
  min-height: unset;
  padding: 8px;
  margin: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  ${font('FONT_NORMAL', 'regular')}

  &[data-panel-open] {
    background: transparent;
    color: inherit;
  }

  &:not([aria-disabled='true']):hover {
    opacity: 0.85;
  }
`

export const SolverStack = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`

export const SolverAvatar = styled.img<{ $stackIndex: number }>`
  position: relative;
  z-index: ${({ $stackIndex }) => 3 - $stackIndex};
  width: 20px;
  height: 20px;
  border-radius: 10px;
  border: 2px solid var(${UI.COLOR_PAPER});
  background: var(${UI.COLOR_PAPER});
  object-fit: cover;

  &:not(:first-child) {
    margin-left: -6px;
  }
`

export const CompetedLabel = styled.span`
  ${font('FONT_NORMAL', 'regular')}
  flex: 1 1 auto;
  min-width: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const WinnerLabel = styled.span`
  ${font('FONT_NORMAL', 'semibold')}
  flex-shrink: 0;
  color: var(${UI.COLOR_TEXT});
  white-space: nowrap;
`

export const Chevron = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  transition: transform 0.2s ease;

  ${ToggleRow}[data-panel-open] & {
    transform: rotate(180deg);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

export const PanelFrame = styled.div`
  border: 1px solid var(${UI.COLOR_BORDER});
  border-radius: 12px;
`
