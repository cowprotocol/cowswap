import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { SummaryRow } from 'common/pure/OrderSummaryRow'

export const FiatWrapper = styled.span`
  margin-left: 5px;
  align-items: center;
  display: flex;
`

export const StepContent = styled.i`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  border: 1px solid var(--cow-color-text-opacity-10);
  border-radius: 16px;
  padding: 10px;
  font-size: 13px;
  font-weight: var(--cow-font-weight-medium);
  font-style: normal;
  cursor: pointer;

  ${Media.upToSmall()} {
    padding: 8px;
  }
`

export const SwapSummaryRow = styled(SummaryRow)`
  margin: 8px 0 8px;
`

export const BridgeSummaryRow = styled(SummaryRow)`
  margin: 0 0 10px;
`
