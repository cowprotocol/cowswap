import { ReactNode } from 'react'

import { bpsToPercent, formatPercent, FractionUtils } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans, useLingui } from '@lingui/react/macro'
import { Nullish } from 'types'

import { ReviewOrderModalAmountRow } from '../ReviewOrderModalAmountRow'

interface ProtocolFeeRowProps {
  protocolFeeAmount: Nullish<CurrencyAmount<Currency>>
  protocolFeeUsd: Nullish<CurrencyAmount<Currency>>
  protocolFeeBps: number | undefined
  withTimelineDot: boolean
}

export function ProtocolFeeRow({
  protocolFeeAmount,
  protocolFeeUsd,
  protocolFeeBps,
  withTimelineDot,
}: ProtocolFeeRowProps): ReactNode {
  const protocolFeeAsPercent = protocolFeeBps ? formatPercent(bpsToPercent(protocolFeeBps)) : null
  const minProtocolFeeAmount = FractionUtils.amountToAtLeastOneWei(protocolFeeAmount)
  const { t } = useLingui()

  if (!protocolFeeAmount || !protocolFeeBps || protocolFeeAmount.equalTo(0)) {
    return null
  }

  return (
    <ReviewOrderModalAmountRow
      withTimelineDot={withTimelineDot}
      amount={minProtocolFeeAmount}
      fiatAmount={protocolFeeUsd}
      tooltip={
        <Trans>
          Protocol fee applied to this trade.
          <br />
          <br />
          The fee is {protocolFeeBps} BPS ({protocolFeeAsPercent}%), applied only if the trade is executed.
        </Trans>
      }
      label={t`Protocol fee (${protocolFeeAsPercent}%)`}
    />
  )
}
