import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import styled from 'styled-components/macro'

import { UI } from '../../enum'

export const Trigger = styled.div`
  display: inline-flex;
  align-items: center;
`

export const Positioner = styled(BaseTooltip.Positioner)`
  z-index: 10;
`

export const Popup = styled(BaseTooltip.Popup)`
  max-width: 320px;
  background: var(${UI.COLOR_PAPER_DARKER});
  color: var(${UI.COLOR_TEXT_PAPER});
  box-shadow: var(${UI.BOX_SHADOW});
  border: 1px solid var(${UI.COLOR_PAPER_DARKEST});
  border-radius: 12px;
  padding: 10px 9px;
  font-size: 13px;
  font-weight: 400;
  word-break: break-word;
  backdrop-filter: blur(20px);
  transform-origin: var(--transform-origin);

  &[data-non-interactive] {
    pointer-events: none;
  }
`

export const Arrow = styled(BaseTooltip.Arrow)`
  width: 8px;
  height: 8px;
  pointer-events: none;
  color: inherit;

  ::before {
    position: absolute;
    width: 8px;
    height: 8px;
    content: '';
    background: var(${UI.COLOR_PAPER_DARKER});
    border: 1px solid var(${UI.COLOR_PAPER_DARKEST});
    transform: rotate(45deg);
  }

  &[data-side='top'] {
    bottom: -5px;

    ::before {
      border-top: none;
      border-left: none;
    }
  }

  &[data-side='bottom'] {
    top: -5px;

    ::before {
      border-bottom: none;
      border-right: none;
    }
  }

  &[data-side='left'] {
    right: -5px;

    ::before {
      border-bottom: none;
      border-left: none;
    }
  }

  &[data-side='right'] {
    left: -5px;

    ::before {
      border-right: none;
      border-top: none;
    }
  }
`
