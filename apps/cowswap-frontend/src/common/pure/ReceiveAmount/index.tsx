import { TokenAmount } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'

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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ReceiveAmount(props: ReceiveAmountProps) {
  const { isSell } = props.receiveAmountInfo

  const { amountAfterFees } = getOrderTypeReceiveAmounts(props.receiveAmountInfo)

  const title = amountAfterFees.toExact() + ' ' + props.currency.symbol

  return (
    <styledEl.ReceiveAmountBox>
      <div>
        <span>
          <Trans>{!isSell ? 'From (incl. costs)' : 'Receive (incl. costs)'}</Trans>
        </span>

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
