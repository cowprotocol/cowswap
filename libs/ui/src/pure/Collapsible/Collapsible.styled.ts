import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible'
import { ChevronDown } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from '../../enum'
import { slowTransition, transition } from '../../utils/animation'
import { font } from '../../utils/font'

export const Root = styled(BaseCollapsible.Root)<{ $isCollapsible?: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  border-radius: ${({ $isCollapsible }) => ($isCollapsible ? '10px' : '0')};
  overflow: ${({ $isCollapsible }) => ($isCollapsible ? 'hidden' : 'visible')};
  /* Use opaque paper (not transparent) so background-color transitions match TradeTokenPair,
     instead of blending through alpha over the modal. */
  background-color: ${({ $isCollapsible }) => ($isCollapsible ? `var(${UI.COLOR_PAPER})` : 'transparent')};
  transition: ${slowTransition(['padding', 'background-color', 'border-radius'])};

  &[data-open] {
    padding: ${({ $isCollapsible }) => ($isCollapsible ? '8px 8px 16px' : '0')};
    border-radius: ${({ $isCollapsible }) => ($isCollapsible ? '14px' : '0')};
    background-color: ${({ $isCollapsible }) => ($isCollapsible ? `var(${UI.COLOR_PAPER_DARKER})` : 'transparent')};
  }
`

export const Trigger = styled(BaseCollapsible.Trigger)`
  --collapsible-trigger-hover-background: var(${UI.COLOR_PAPER_DARKER});
  --collapsible-trigger-open-hover-background: var(${UI.COLOR_PAPER_DARKEST});

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
  cursor: default;
  user-select: none;
  transition: ${transition(['background-color', 'color'])};

  /* Base UI uses aria-disabled (focusableWhenDisabled), not the native disabled attribute. */
  &:not([aria-disabled='true']) {
    cursor: pointer;

    &:hover {
      background: var(--collapsible-trigger-hover-background);
    }
  }

  &[data-panel-open] {
    color: var(${UI.COLOR_PRIMARY});
    background: color-mix(in srgb, var(${UI.COLOR_PAPER_DARKER}) 50%, var(${UI.COLOR_PAPER_DARKEST}));

    &:not([aria-disabled='true']):hover {
      background: var(--collapsible-trigger-open-hover-background);
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
  transition: ${slowTransition(['transform', 'color'])};

  ${Trigger}[data-panel-open] & {
    color: var(${UI.COLOR_PRIMARY});
    transform: rotate(180deg);
  }
`

export const Panel = styled(BaseCollapsible.Panel)`
  box-sizing: border-box;
  height: var(--collapsible-panel-height);
  overflow: hidden;
  transition: ${slowTransition(['height'])};

  &[data-starting-style],
  &[data-ending-style] {
    height: 0;
  }
`
