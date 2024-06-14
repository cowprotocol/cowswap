import { bpsToPercent, formatPercent } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import * as styledEl from '../../containers/TradeBasicConfirmDetails/styled'
import { ReviewOrderModalAmountRow } from '../ReviewOrderModalAmountRow'

interface PartnerFeeRowProps {
  partnerFeeAmount: Nullish<CurrencyAmount<Currency>>
  partnerFeeUsd: Nullish<CurrencyAmount<Currency>>
  partnerFeeBps: number | undefined
  withTimelineDot: boolean
  alwaysRow?: boolean
  feeTooltipMarkdown?: string
}

export function PartnerFeeRow({
  partnerFeeAmount,
  partnerFeeUsd,
  partnerFeeBps,
  withTimelineDot,
  alwaysRow,
  feeTooltipMarkdown,
}: PartnerFeeRowProps) {
  const feeAsPercent = partnerFeeBps ? formatPercent(bpsToPercent(partnerFeeBps)) : null

  return (
    <>
      {partnerFeeAmount?.greaterThan(0) && partnerFeeBps ? (
        <ReviewOrderModalAmountRow
          withTimelineDot={withTimelineDot}
          amount={partnerFeeAmount}
          fiatAmount={partnerFeeUsd}
          alwaysRow={alwaysRow}
          tooltip={
            feeTooltipMarkdown || (
              <>
                This fee helps pay for maintenance & improvements to the trade experience.
                <br />
                <br />
                The fee is {partnerFeeBps} BPS ({feeAsPercent}%), applied only if the trade is executed.
              </>
            )
          }
          label={`Total fee (${feeAsPercent}%)`}
        />
      ) : (
        <ReviewOrderModalAmountRow
          withTimelineDot={withTimelineDot}
          alwaysRow={alwaysRow}
          tooltip="Unlike other exchanges, CoW Swap doesn’t charge a fee for trading!"
          label="Fee"
        >
          <styledEl.GreenText>FREE</styledEl.GreenText>
        </ReviewOrderModalAmountRow>
      )}
    </>
  )
}
