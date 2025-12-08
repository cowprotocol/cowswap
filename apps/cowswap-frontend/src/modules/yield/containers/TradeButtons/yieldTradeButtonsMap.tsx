import { ReactNode } from 'react'

import { InfoTooltip } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { YieldFormState } from '../../hooks/useYieldFormState'

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
`

type YieldTradeButton = {
  id?: string
  text: ReactNode | string
}
export const yieldTradeButtonsMap: Record<YieldFormState, YieldTradeButton> = {
  [YieldFormState.Erc20BuyIsNotAllowed]: {
    text: (
      <Wrapper>
        <Trans>Swaps not supported</Trans>{' '}
        <InfoTooltip>
          <div>
            <Trans>Use the Swap tab for trades that don't involve an LP token.</Trans>
          </div>
        </InfoTooltip>
      </Wrapper>
    ),
  },
}
