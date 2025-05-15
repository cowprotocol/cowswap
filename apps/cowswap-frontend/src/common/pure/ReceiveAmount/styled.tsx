import { Media, UI } from '@cowprotocol/ui'
import { HelpTooltip } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ReceiveAmountBox = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-radius: 0 0 16px 16px;
  font-size: 14px;
  font-weight: 600;
  background: var(${UI.COLOR_PAPER});
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});

  ${Media.upToSmall()} {
    flex-direction: column;
    align-items: start;
    gap: 0.5rem;
  }

  > div {
    display: flex;
    align-items: center;

    &:first-child {
      font-weight: 500;
    }

    &:last-child {
      text-align: right;
    }
  }
`

export const ReceiveAmountValue = styled.span`
  font-size: 21px;
`

export const QuestionHelperWrapped = styled(HelpTooltip)`
  display: inline-block;
  vertical-align: bottom;
  line-height: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_60});

  &:hover {
    color: var(${UI.COLOR_TEXT});
  }
`
