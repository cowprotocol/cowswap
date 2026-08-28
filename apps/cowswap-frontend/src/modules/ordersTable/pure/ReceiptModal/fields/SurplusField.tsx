import { ReactNode } from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'
import { CurrencyAmount } from '@cowprotocol/currency'
import { TokenAmount } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from '../ReceiptModal.styled'

interface SurplusFieldProps {
  order: ParsedOrder
}

export function SurplusField({ order }: SurplusFieldProps): ReactNode {
  const { kind, inputToken, outputToken } = order
  const { surplusAmount, surplusPercentage } = order.executionData

  const surplusToken = isSellOrder(kind) ? outputToken : inputToken

  if (!surplusToken || !surplusAmount || surplusAmount.isLessThanOrEqualTo(0)) {
    return null
  }

  const parsedSurplus = CurrencyAmount.fromRawAmount(surplusToken, surplusAmount?.decimalPlaces(0).toFixed())
  const formattedPercent = surplusPercentage?.multipliedBy(100)?.toFixed(2)

  return (
    <styledEl.SurplusCard title={`${parsedSurplus.toExact()} ${surplusToken.symbol}`}>
      <styledEl.SurplusLabel>{t`Order surplus`}</styledEl.SurplusLabel>
      <styledEl.SurplusValue>
        +<TokenAmount amount={parsedSurplus} tokenSymbol={surplusToken} />
      </styledEl.SurplusValue>
      <styledEl.SurplusPercent>
        +{formattedPercent}% <Trans>more than min. amount</Trans>
      </styledEl.SurplusPercent>
    </styledEl.SurplusCard>
  )
}
