import { ReactNode } from 'react'

import { bpsToPercent, formatPercent, FractionUtils } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans, useLingui } from '@lingui/react/macro'
import { Nullish } from 'types'

import { WidgetMarkdownContent } from 'modules/injectedWidget'
import { VolumeFeeTooltip } from 'modules/volumeFee'

import { FreeFeeRow } from '../FreeFeeRow'
import { ReviewOrderModalAmountRow } from '../ReviewOrderModalAmountRow'

interface PartnerFeeRowProps {
  partnerFeeAmount: Nullish<CurrencyAmount<Currency>>
  partnerFeeUsd: Nullish<CurrencyAmount<Currency>>
  partnerFeeBps: number | undefined
  withTimelineDot: boolean
  volumeFeeTooltip: VolumeFeeTooltip
  isLast?: boolean
}

export function PartnerFeeRow({
  partnerFeeAmount,
  partnerFeeUsd,
  partnerFeeBps,
  withTimelineDot,
  volumeFeeTooltip,
  isLast = false,
}: PartnerFeeRowProps): ReactNode {
  const feeAsPercent = partnerFeeBps ? formatPercent(bpsToPercent(partnerFeeBps)) : null
  const minPartnerFeeAmount = FractionUtils.amountToAtLeastOneWei(partnerFeeAmount)
  const { t } = useLingui()

  if (!partnerFeeAmount || !partnerFeeBps || partnerFeeAmount.equalTo(0)) {
    return <FreeFeeRow withTimelineDot={false} />
  }

  const label = volumeFeeTooltip.label

  return (
    <ReviewOrderModalAmountRow
      withTimelineDot={withTimelineDot}
      amount={minPartnerFeeAmount}
      fiatAmount={partnerFeeUsd}
      tooltip={
        volumeFeeTooltip.content ? (
          <WidgetMarkdownContent>{volumeFeeTooltip.content}</WidgetMarkdownContent>
        ) : (
          <Trans>
            This fee helps pay for maintenance & improvements to the trade experience.
            <br />
            <br />
            The fee is {partnerFeeBps} BPS ({feeAsPercent}%), applied only if the trade is executed.
          </Trans>
        )
      }
      label={t`${label} (${feeAsPercent}%)`}
      isLast={isLast}
    />
  )
}
