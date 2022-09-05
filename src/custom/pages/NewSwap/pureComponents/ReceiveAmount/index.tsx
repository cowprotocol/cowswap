import { ReceiveAmountBox, ReceiveAmountValue } from 'pages/NewSwap/pureComponents/ReceiveAmount/styled'
import React from 'react'
import { ReceiveAmountInfoTooltip } from 'pages/NewSwap/pureComponents/ReceiveAmountInfo'
import * as styledEl from './styled'
import { ReceiveAmountInfo } from 'pages/NewSwap/helpers/tradeReceiveAmount'
import { Currency } from '@uniswap/sdk-core'
import { BalanceAndSubsidy } from 'hooks/useCowBalanceAndSubsidy'
import { Trans } from '@lingui/macro'

export interface ReceiveAmountProps {
  receiveAmountInfo: ReceiveAmountInfo
  currency: Currency
  subsidyAndBalance: BalanceAndSubsidy
  allowsOffchainSigning: boolean
}

export function ReceiveAmount(props: ReceiveAmountProps) {
  const { type, amountAfterFees } = props.receiveAmountInfo

  return (
    <ReceiveAmountBox>
      <div>
        <span>
          <Trans>{type === 'from' ? 'From (incl. fee)' : 'Receive (incl. fee)'}</Trans>
        </span>

        <styledEl.QuestionHelperWrapped text={<ReceiveAmountInfoTooltip {...props} />} />
      </div>
      <div>
        <ReceiveAmountValue>{amountAfterFees}</ReceiveAmountValue>
      </div>
    </ReceiveAmountBox>
  )
}
