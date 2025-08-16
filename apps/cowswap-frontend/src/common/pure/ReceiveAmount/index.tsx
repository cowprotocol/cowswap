import { ReactNode } from 'react'

import { TokenAmount } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'

import { BalanceAndSubsidy } from 'legacy/hooks/useCowBalanceAndSubsidy'

import { getOrderTypeReceiveAmounts } from 'modules/trade'
import { ReceiveAmountInfo } from 'modules/trade/types'

import * as styledEl from './styled'

import { ReceiveAmountInfoTooltip } from '../ReceiveAmountInfo'
export interface ReceiveAmountProps {
  receiveAmountInfo: ReceiveAmountInfo
  currency: Currency
  subsidyAndBalance: BalanceAndSubsidy
  allowsOffchainSigning: boolean
}

export function ReceiveAmount(props: ReceiveAmountProps): ReactNode {
  const { isSell } = props.receiveAmountInfo

  const { amountAfterFees } = getOrderTypeReceiveAmounts(props.receiveAmountInfo)

  const title = amountAfterFees.toExact() + ' ' + props.currency.symbol

  return (
    <styledEl.ReceiveAmountBox>
      <div>
        <span>{!isSell ? t`From (incl. costs)` : t`Receive (incl. costs)`}</span>
        <styledEl.QuestionHelperWrapped text={<ReceiveAmountInfoTooltip {...props} />} />
      </div>
      <div>
        <styledEl.ReceiveAmountValue title={title}>
          <TokenAmount amount={amountAfterFees} defaultValue="0" />
        </styledEl.ReceiveAmountValue>
      </div>
    </styledEl.ReceiveAmountBox>
  )
}
