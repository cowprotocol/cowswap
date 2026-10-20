import { font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

export const ToggleRow = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px;
  margin: 0;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;

  &:hover {
    opacity: 0.85;
  }
`

export const SolverStack = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`

export const SolverAvatar = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  border: 2px solid var(${UI.COLOR_PAPER});
  background: var(${UI.COLOR_PAPER});
  object-fit: cover;

  &:not(:first-child) {
    margin-left: -5px;
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

export const Chevron = styled.span<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  transform: rotate(${({ $expanded }) => ($expanded ? '180deg' : '0deg')});
  transition: transform 0.2s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

export const ExpandedPanel = styled.div`
  width: 100%;
  padding: 8px;
`
