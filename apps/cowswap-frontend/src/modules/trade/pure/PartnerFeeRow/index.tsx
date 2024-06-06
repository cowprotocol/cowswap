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
  feeTooltipMarkdown?: string
}

export function PartnerFeeRow({
  partnerFeeAmount,
  partnerFeeUsd,
  partnerFeeBps,
  withTimelineDot,
  feeTooltipMarkdown,
}: PartnerFeeRowProps) {
  return (
    <>
      {partnerFeeAmount?.greaterThan(0) && partnerFeeBps ? (
        <ReviewOrderModalAmountRow
          withTimelineDot={withTimelineDot}
          amount={partnerFeeAmount}
          fiatAmount={partnerFeeUsd}
          tooltip={
            feeTooltipMarkdown || (
              <>
                This fee helps pay for maintenance & improvements to the swap experience.
                <br />
                <br />
                The fee is {partnerFeeBps} BPS ({formatPercent(bpsToPercent(partnerFeeBps))}%), applied only if the
                trade is executed.
              </>
            )
          }
          label="Total fee"
        />
      ) : (
        <ReviewOrderModalAmountRow
          withTimelineDot={withTimelineDot}
          tooltip="Unlike other exchanges, CoW Swap doesn’t charge a fee for trading!"
          label="Fee"
        >
          <styledEl.GreenText>FREE</styledEl.GreenText>
        </ReviewOrderModalAmountRow>
      )}
    </>
  )
}
