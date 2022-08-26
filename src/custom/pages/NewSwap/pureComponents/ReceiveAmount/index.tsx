import { ReceiveAmountBox, ReceiveAmountValue } from 'pages/LimitOrder/pureComponents/ReceiveAmount/styled'
import React from 'react'
import { ReceiveAmountInfo } from 'pages/LimitOrder/pureComponents/ReceiveAmountInfo'
import * as styledEl from './styled'

export function ReceiveAmount() {
  return (
    <ReceiveAmountBox>
      <div>
        <span>Receive (incl. fee)</span>

        <styledEl.QuestionHelperWrapped text={<ReceiveAmountInfo />} />
      </div>
      <div>
        <ReceiveAmountValue>0.9998</ReceiveAmountValue>
      </div>
    </ReceiveAmountBox>
  )
}
