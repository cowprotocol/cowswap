import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { TradeSelect } from 'modules/trade/pure/TradeSelect'
import { Content } from 'modules/trade/pure/TradeWidgetField/styled'

import { TradeWidgetField } from '../../../trade/pure/TradeWidgetField'

export const StyledTradeSelect = styled(TradeSelect)`
  font-weight: 500;
  color: inherit;

  button[data-reach-menu-button] {
    width: 100%;
    height: auto;
    justify-content: space-between;
    font-size: 18px;

    &:hover,
    &:active,
    &:focus {
      background: none;
      border-radius: 0;
    }
  }

  > svg {
    color: inherit;
    stroke: currentColor;
    opacity: 0.7;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  }

  &:hover > svg {
    opacity: 1;
  }

  ${Content} {
    width: 100%;
    color: inherit;
  }

  ${Content} > div {
    width: 100%;
  }
`

export const StyledTradeField = styled(TradeWidgetField)`
  ${Content} {
    width: 100%;
    color: inherit;
  }

  ${Content} > div {
    width: 100%;
  }
`
