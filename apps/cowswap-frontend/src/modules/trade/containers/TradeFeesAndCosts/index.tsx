import React from 'react'

import { bpsToPercent, formatPercent } from '@cowprotocol/common-utils'
import { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'

import { useUsdAmount } from '../../../usdAmount'
import { ReviewOrderModalAmountRow } from '../../pure/ReviewOrderModalAmountRow'
import { ReceiveAmountInfo } from '../../types'
import { getDirectedReceiveAmounts } from '../../utils/getReceiveAmountInfo'
import * as styledEl from '../TradeBasicConfirmDetails/styled'

interface TradeFeesAndCostsProps {
  receiveAmountInfo: ReceiveAmountInfo
  widgetParams: Partial<CowSwapWidgetAppParams>
  withTimelineDot?: boolean
}

export function TradeFeesAndCosts(props: TradeFeesAndCostsProps) {
  const { receiveAmountInfo, widgetParams, withTimelineDot = true } = props
  const { networkFeeAmount } = getDirectedReceiveAmounts(receiveAmountInfo)
  const {
    costs: {
      partnerFee: { amount: partnerFeeAmount, bps: partnerFeeBps },
    },
  } = receiveAmountInfo

  const partnerFeeUsd = useUsdAmount(partnerFeeAmount).value
  const networkFeeAmountUsd = useUsdAmount(networkFeeAmount).value

  return (
    <>
      {/*Partner fee*/}
      {partnerFeeAmount.greaterThan(0) ? (
        <ReviewOrderModalAmountRow
          withTimelineDot={withTimelineDot}
          amount={partnerFeeAmount}
          fiatAmount={partnerFeeUsd}
          tooltip={
            widgetParams.content?.feeTooltipMarkdown || (
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

      {/*Network cost*/}
      {networkFeeAmount.greaterThan(0) && (
        <ReviewOrderModalAmountRow
          withTimelineDot={withTimelineDot}
          amount={networkFeeAmount}
          fiatAmount={networkFeeAmountUsd}
          tooltip={
            <>
              This is the cost of settling your order on-chain, including gas and any LP fees.
              <br />
              CoW Swap will try to lower this cost where possible.
            </>
          }
          label="Network costs (est.)"
        />
      )}
    </>
  )
}
