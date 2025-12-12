import { ReactNode } from 'react'

import { TokenAmount } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'

import { BalanceAndSubsidy } from 'legacy/hooks/useCowBalanceAndSubsidy'

import { getOrderTypeReceiveAmounts } from 'modules/trade'
import { useEstimatedBridgeBuyAmount } from 'modules/trade'
import { ReceiveAmountInfo } from 'modules/trade/types'

import * as styledEl from './styled'

import { BridgeReceiveAmountInfo } from '../BridgeReceiveAmountInfo'
import { ReceiveAmountInfoTooltip } from '../ReceiveAmountInfo'

export interface ReceiveAmountProps {
  receiveAmountInfo: ReceiveAmountInfo
  subsidyAndBalance: BalanceAndSubsidy
  allowsOffchainSigning: boolean
  loading?: boolean
}

export function ReceiveAmount(props: ReceiveAmountProps): ReactNode {
  const { isSell } = props.receiveAmountInfo
  const { t } = useLingui()
  const bridgeEstimatedAmounts = useEstimatedBridgeBuyAmount()

  const { amountAfterFees } = getOrderTypeReceiveAmounts(props.receiveAmountInfo)

  const expectedToReceiveAmount = bridgeEstimatedAmounts?.expectedToReceiveAmount ?? amountAfterFees
  const title = expectedToReceiveAmount.toExact() + ' ' + expectedToReceiveAmount.currency.symbol

  return (
    <styledEl.ReceiveAmountBox>
      <div>
        <span>{!isSell ? t`From (incl. fees)` : t`Receive (incl. fees)`}</span>
        <styledEl.QuestionHelperWrapped
          text={
            bridgeEstimatedAmounts ? (
              <BridgeReceiveAmountInfo bridgeEstimatedAmounts={bridgeEstimatedAmounts} />
            ) : (
              <ReceiveAmountInfoTooltip {...props} />
            )
          }
        />
      </div>
      <div>
        <styledEl.ReceiveAmountValue title={title}>
          <TokenAmount amount={expectedToReceiveAmount} defaultValue="0" />
        </styledEl.ReceiveAmountValue>
      </div>
    </styledEl.ReceiveAmountBox>
  )
}
