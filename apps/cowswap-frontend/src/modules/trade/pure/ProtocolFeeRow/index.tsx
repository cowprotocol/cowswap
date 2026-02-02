import { ReactNode } from 'react'

import { bpsToPercent, FractionUtils, trimTrailingZeros } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Nullish } from 'types'

import { PROTOCOL_FEE_SCALE } from 'common/constants/common'

import { ReviewOrderModalAmountRow } from '../ReviewOrderModalAmountRow'

interface ProtocolFeeRowProps {
  protocolFeeAmount: Nullish<CurrencyAmount<Currency>>
  protocolFeeUsd: Nullish<CurrencyAmount<Currency>>
  protocolFeeBps: number | undefined
  withTimelineDot: boolean
  isLast?: boolean
}

export function ProtocolFeeRow({
  protocolFeeAmount,
  protocolFeeUsd,
  protocolFeeBps,
  withTimelineDot,
  isLast = false,
}: ProtocolFeeRowProps): ReactNode {
  const protocolFeeAsPercent = protocolFeeBps
    ? trimTrailingZeros(
        bpsToPercent(protocolFeeBps * PROTOCOL_FEE_SCALE)
          .divide(PROTOCOL_FEE_SCALE)
          .toSignificant(),
      )
    : null
  const minProtocolFeeAmount = FractionUtils.amountToAtLeastOneWei(protocolFeeAmount)

  if (!protocolFeeAmount || !protocolFeeBps || protocolFeeAmount.equalTo(0)) {
    return null
  }

  if (!protocolFeeAsPercent) return null

  return (
    <ReviewOrderModalAmountRow
      withTimelineDot={withTimelineDot}
      amount={minProtocolFeeAmount}
      fiatAmount={protocolFeeUsd}
      tooltip={
        <Trans>
          This {protocolFeeBps} BPS fee incentivizes solvers to find better prices for users. It is only applied if the
          trade is executed.
        </Trans>
      }
      label={t`Protocol fee (${protocolFeeAsPercent}%)`}
      isLast={isLast}
    />
  )
}
