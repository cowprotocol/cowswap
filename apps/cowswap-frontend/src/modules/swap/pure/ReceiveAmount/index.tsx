import { Currency } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'

import { BalanceAndSubsidy } from 'legacy/hooks/useCowBalanceAndSubsidy'

import { ReceiveAmountInfo } from 'modules/swap/helpers/tradeReceiveAmount'
import { ReceiveAmountInfoTooltip } from 'modules/swap/pure/ReceiveAmountInfo'

import * as styledEl from './styled'

export interface ReceiveAmountProps {
  receiveAmountInfo: ReceiveAmountInfo
  currency: Currency
  subsidyAndBalance: BalanceAndSubsidy
  allowsOffchainSigning: boolean
}

export function ReceiveAmount(props: ReceiveAmountProps) {
  const { type, amountAfterFees, amountAfterFeesRaw } = props.receiveAmountInfo
  const title = amountAfterFeesRaw.toExact() + ' ' + props.currency.symbol

  return (
    <styledEl.ReceiveAmountBox>
      <div>
        <span>
          <Trans>{type === 'from' ? 'From (incl. costs)' : 'Receive (incl. costs)'}</Trans>
        </span>

        <styledEl.QuestionHelperWrapped text={<ReceiveAmountInfoTooltip {...props} />} />
      </div>
      <div>
        <styledEl.ReceiveAmountValue title={title}>{amountAfterFees}</styledEl.ReceiveAmountValue>
      </div>
    </styledEl.ReceiveAmountBox>
  )
}
