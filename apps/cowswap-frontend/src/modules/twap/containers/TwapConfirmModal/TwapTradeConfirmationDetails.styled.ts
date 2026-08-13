import { Accordion, UI, slowTransition } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 12px;
  transition: ${slowTransition(['padding', 'margin', 'background-color'])};
`

export const TriggerSlot = styled.div<{ $isVisible: boolean }>`
  display: grid;
  grid-template-rows: ${({ $isVisible }) => ($isVisible ? '1fr' : '0fr')};
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  pointer-events: ${({ $isVisible }) => ($isVisible ? 'auto' : 'none')};
  transition: ${slowTransition(['grid-template-rows', 'opacity'])};

  > * {
    min-height: 0;
    overflow: hidden;
  }
`

export const Trigger = styled(Accordion.Trigger)<{ $isExpanded: boolean }>`
  background: transparent;

  &:hover {
    background: ${({ $isExpanded }) =>
      $isExpanded ? `var(${UI.COLOR_PAPER_DARKEST})` : `var(${UI.COLOR_PAPER_DARKER})`};
  }
`

export const Body = styled.div<{ $withTopPadding: boolean }>`
  display: flex;
  flex-direction: column;
  padding-top: ${({ $withTopPadding }) => ($withTopPadding ? '10px' : '0')};
  transition: ${slowTransition(['padding-top'])};
`
