import { Accordion as BaseAccordion } from '@base-ui/react/accordion'
import { ChevronDown } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from '../../enum'
import { slowTransition, transition } from '../../utils/animation'

export const Root = styled(BaseAccordion.Root)`
  width: 100%;
  display: flex;
  flex-direction: column;
`

export const Item = styled(BaseAccordion.Item)<{ $isCollapsible?: boolean }>`
  width: 100%;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
  /* Use opaque paper (not transparent) so background-color transitions match ConfirmAmounts,
     instead of blending through alpha over the modal. */
  background-color: ${({ $isCollapsible }) => ($isCollapsible ? `var(${UI.COLOR_PAPER})` : 'transparent')};
  transition: ${slowTransition(['padding', 'background-color'])};

  &[data-open] {
    padding: ${({ $isCollapsible = true }) => ($isCollapsible ? '8px' : '0')};
    background-color: ${({ $isCollapsible = true }) =>
      $isCollapsible ? `var(${UI.COLOR_PAPER_DARKER})` : 'transparent'};
  }
`

export const Header = styled(BaseAccordion.Header)`
  margin: 0;
`

export const Trigger = styled(BaseAccordion.Trigger)`
  box-sizing: border-box;
  display: flex;
  width: 100%;
  min-height: var(${UI.CLICKABLE_SIZE});
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(${UI.COLOR_TEXT});
  font-family: inherit;
  font-size: var(${UI.FONT_SIZE_SMALL});
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  line-height: 1.4;
  text-align: center;
  cursor: pointer;
  user-select: none;
  transition: ${transition(['background-color'])};

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_TEXT});
    outline-offset: 2px;
  }
`

export const Chevron = styled(ChevronDown)`
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  transition: ${slowTransition(['transform'])};

  ${Trigger}[data-panel-open] & {
    transform: rotate(180deg);
  }
`

export const Panel = styled(BaseAccordion.Panel)`
  box-sizing: border-box;
  height: var(--accordion-panel-height);
  overflow: hidden;
  transition: ${slowTransition(['height'])};

  &[data-starting-style],
  &[data-ending-style] {
    height: 0;
  }
`
