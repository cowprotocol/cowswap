import { Accordion as BaseAccordion } from '@base-ui/react/accordion'
import { ChevronDown } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from '../../enum'
import { slowTransition, transition } from '../../utils/animation'
import { font } from '../../utils/font'

export const Root = styled(BaseAccordion.Root)`
  width: 100%;
  display: flex;
  flex-direction: column;
`

export const Item = styled(BaseAccordion.Item)<{ $isCollapsible?: boolean }>`
  width: 100%;
  border-radius: ${({ $isCollapsible }) => ($isCollapsible ? '10px' : '12px')};
  padding: 0;
  overflow: hidden;
  /* Use opaque paper (not transparent) so background-color transitions match ConfirmAmounts,
     instead of blending through alpha over the modal. */
  background-color: ${({ $isCollapsible }) => ($isCollapsible ? `var(${UI.COLOR_PAPER})` : 'transparent')};
  transition: ${slowTransition(['padding', 'background-color', 'border-radius'])};

  &[data-open] {
    padding: ${({ $isCollapsible }) => ($isCollapsible ? '8px 8px 16px' : '0')};
    border-radius: ${({ $isCollapsible }) => ($isCollapsible ? '14px' : '12px')};
    background-color: ${({ $isCollapsible }) => ($isCollapsible ? `var(${UI.COLOR_PAPER_DARKER})` : 'transparent')};
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
  padding: 12px;
  margin: 0;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(${UI.COLOR_TEXT2});
  ${font('FONT_NORMAL', 'medium')}
  text-align: center;
  cursor: pointer;
  user-select: none;
  transition: ${transition(['background-color', 'color'])};

  &:hover {
    background: var(${UI.COLOR_PAPER_DARKER});
  }

  &[data-panel-open] {
    color: var(${UI.COLOR_PRIMARY});
    background: color-mix(in srgb, var(${UI.COLOR_PAPER_DARKER}) 50%, var(${UI.COLOR_PAPER_DARKEST}));

    &:hover {
      background: var(${UI.COLOR_PAPER_DARKEST});
    }
  }

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
