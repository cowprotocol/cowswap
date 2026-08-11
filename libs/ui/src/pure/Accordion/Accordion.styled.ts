import { Accordion as BaseAccordion } from '@base-ui/react/accordion'
import { ChevronDown } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from '../../enum'

export const Root = styled(BaseAccordion.Root)`
  width: 100%;
  display: flex;
  flex-direction: column;
`

export const Item = styled(BaseAccordion.Item)`
  width: 100%;
`

export const Header = styled(BaseAccordion.Header)`
  margin: 0;
`

export const Trigger = styled(BaseAccordion.Trigger)`
  box-sizing: border-box;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  color: var(${UI.COLOR_TEXT});
  font-family: inherit;
  font-size: var(${UI.FONT_SIZE_SMALL});
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  line-height: 1.4;
  text-align: center;
  cursor: pointer;
  user-select: none;

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_TEXT});
    outline-offset: 2px;
    border-radius: 4px;
  }
`

// TODO: debug — revert to var(${UI.ANIMATION_DURATION_SLOW})
const DEBUG_TRANSITION_DURATION = '10s'

export const Chevron = styled(ChevronDown)`
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  transition: transform ${DEBUG_TRANSITION_DURATION} ease-in-out;

  ${Trigger}[data-panel-open] & {
    transform: rotate(180deg);
  }
`

export const Panel = styled(BaseAccordion.Panel)`
  box-sizing: border-box;
  height: var(--accordion-panel-height);
  overflow: hidden;
  transition: height ${DEBUG_TRANSITION_DURATION} ease-in-out;

  &[data-starting-style],
  &[data-ending-style] {
    height: 0;
  }
`
