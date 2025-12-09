import { Media, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { darken, transparentize } from 'color2k'
import styled from 'styled-components/macro'

import { EthFlowState } from '../../services/ethFlow/types'

const ModalMessage = styled.div`
  display: flex;
  flex-flow: row wrap;
  padding: 16px 0 0;
  width: 100%;
  color: ${({ theme }) => transparentize(theme.text, 0.15)};
  font-size: 14px;
  line-height: 1.3;

  ${Media.upToSmall()} {
    margin-top: 2rem;
  }

  > span {
    margin: 0 0 8px;
  }
`

const LowBalanceMessage = styled(ModalMessage)`
  margin: 0 0 10px;
  background: ${({ theme }) => (theme.darkMode ? transparentize(theme.alert, 0.9) : transparentize(theme.alert, 0.85))};
  color: ${({ theme }) => (theme.darkMode ? `var(${UI.COLOR_ALERT})` : darken(theme.alert, 0.2))};
  padding: 16px;
  border-radius: 16px;
  width: 100%;
  box-sizing: border-box;
  line-height: 1.5;

  > strong {
    display: contents;
  }
`

