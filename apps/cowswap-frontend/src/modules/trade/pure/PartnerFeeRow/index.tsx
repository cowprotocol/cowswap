import { bpsToPercent, formatPercent, FractionUtils } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { WidgetMarkdownContent } from 'modules/injectedWidget'
import { VolumeFeeTooltip } from 'modules/volumeFee'

import * as styledEl from '../../containers/TradeBasicConfirmDetails/styled'
import { ReviewOrderModalAmountRow } from '../ReviewOrderModalAmountRow'

interface PartnerFeeRowProps {
  partnerFeeAmount: Nullish<CurrencyAmount<Currency>>
  partnerFeeUsd: Nullish<CurrencyAmount<Currency>>
  partnerFeeBps: number | undefined
  withTimelineDot: boolean
  alwaysRow?: boolean
  volumeFeeTooltip: VolumeFeeTooltip
}

export function PartnerFeeRow({
  partnerFeeAmount,
  partnerFeeUsd,
  partnerFeeBps,
  withTimelineDot,
  alwaysRow,
  volumeFeeTooltip,
}: PartnerFeeRowProps) {
  const feeAsPercent = partnerFeeBps ? formatPercent(bpsToPercent(partnerFeeBps)) : null
  const minPartnerFeeAmount = FractionUtils.amountToAtLeastOneWei(partnerFeeAmount)

  return (
    <>
      {partnerFeeAmount && partnerFeeBps ? (
        <ReviewOrderModalAmountRow
          withTimelineDot={withTimelineDot}
          amount={minPartnerFeeAmount}
          fiatAmount={partnerFeeUsd}
          alwaysRow={alwaysRow}
          tooltip={
            volumeFeeTooltip.content ? (
              <WidgetMarkdownContent>{volumeFeeTooltip.content}</WidgetMarkdownContent>
            ) : (
              <>
                This fee helps pay for maintenance & improvements to the trade experience.
                <br />
                <br />
                The fee is {partnerFeeBps} BPS ({feeAsPercent}%), applied only if the trade is executed.
              </>
            )
          }
          label={`${volumeFeeTooltip.label} (${feeAsPercent}%)`}
        />
      ) : (
        <ReviewOrderModalAmountRow
          withTimelineDot={withTimelineDot}
          alwaysRow={alwaysRow}
          tooltip="No fee for order placement!"
          label="Fee"
        >
          <styledEl.GreenText>FREE</styledEl.GreenText>
        </ReviewOrderModalAmountRow>
      )}
    </>
  )
}
