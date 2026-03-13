import { FancyButton, RowBetween, UI } from '@cowprotocol/ui'

import { darken } from 'color2k'
import styled from 'styled-components/macro'

export const OptionCustom = styled(FancyButton)<{ active?: boolean; warning?: boolean }>`
  height: 2rem;
  position: relative;
  padding: 0 0.75rem;
  flex: 1;
  border: ${({ theme, active, warning }) => active && `1px solid ${warning ? theme.error : theme.bg2}`};

  :hover {
    border: ${({ theme, active, warning }) =>
      active && `1px solid ${warning ? darken(theme.error, 0.1) : darken(theme.bg2, 0.1)}`};
  }
`

export const Wrapper = styled.div`
  ${RowBetween} > button, ${OptionCustom} {
    &:disabled {
      color: var(${UI.COLOR_TEXT_OPACITY_50});
      background-color: var(${UI.COLOR_PAPER});
      border: none;
      pointer-events: none;
    }
  }
`
