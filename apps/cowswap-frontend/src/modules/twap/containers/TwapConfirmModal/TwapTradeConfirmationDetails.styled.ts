import { Accordion, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

// TODO: revert to var(${UI.ANIMATION_DURATION_SLOW})
const DEBUG_TRANSITION_DURATION = '10s'

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 12px;
  transition:
    padding ${DEBUG_TRANSITION_DURATION} ease-in-out,
    margin ${DEBUG_TRANSITION_DURATION} ease-in-out,
    background-color ${DEBUG_TRANSITION_DURATION} ease-in-out;
`

export const TriggerSlot = styled.div<{ $isVisible: boolean }>`
  display: grid;
  grid-template-rows: ${({ $isVisible }) => ($isVisible ? '1fr' : '0fr')};
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  pointer-events: ${({ $isVisible }) => ($isVisible ? 'auto' : 'none')};
  transition:
    grid-template-rows ${DEBUG_TRANSITION_DURATION} ease-in-out,
    opacity ${DEBUG_TRANSITION_DURATION} ease-in-out;

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
  transition: padding-top ${DEBUG_TRANSITION_DURATION} ease-in-out;
`
