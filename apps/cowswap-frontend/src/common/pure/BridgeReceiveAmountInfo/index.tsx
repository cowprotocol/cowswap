import React, { ReactNode } from 'react'

import { TokenAmount } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { BridgeEstimatedAmounts } from 'common/types/bridge'

import { FeeItem } from '../ReceiveAmountInfo/FeeItem'
import * as styledEl from '../ReceiveAmountInfo/styled'

export interface BridgeReceiveAmountInfoProps {
  bridgeEstimatedAmounts: BridgeEstimatedAmounts
}

export function BridgeReceiveAmountInfo(props: BridgeReceiveAmountInfoProps): ReactNode {
  const {
    bridgeEstimatedAmounts: { expectedToReceiveAmount, minToReceiveAmount, feeAmount },
  } = props
  return (
    <styledEl.Box>
      <div>
        <span>
          <Trans>Before costs</Trans>
        </span>
        <span>
          <TokenAmount
            amount={expectedToReceiveAmount}
            tokenSymbol={expectedToReceiveAmount.currency}
            defaultValue="0"
          />
        </span>
      </div>

      <FeeItem title={t`Bridge costs`} isSell feeAmount={feeAmount} />

      <styledEl.TotalAmount>
        <span>{t`To`}</span>
        <span>
          <TokenAmount amount={minToReceiveAmount} tokenSymbol={minToReceiveAmount.currency} defaultValue="0" />
        </span>
      </styledEl.TotalAmount>
    </styledEl.Box>
  )
}
