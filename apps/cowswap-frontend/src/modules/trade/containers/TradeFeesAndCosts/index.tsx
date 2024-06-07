import { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'

import { useUsdAmount } from '../../../usdAmount'
import { PartnerFeeRow } from '../../pure/PartnerFeeRow'
import { ReviewOrderModalAmountRow } from '../../pure/ReviewOrderModalAmountRow'
import { ReceiveAmountInfo } from '../../types'
import { getOrderTypeReceiveAmounts } from '../../utils/getReceiveAmountInfo'

interface TradeFeesAndCostsProps {
  receiveAmountInfo: ReceiveAmountInfo | null
  widgetParams: Partial<CowSwapWidgetAppParams>
  withTimelineDot?: boolean
}

export function TradeFeesAndCosts(props: TradeFeesAndCostsProps) {
  const { receiveAmountInfo, widgetParams, withTimelineDot = true } = props

  const networkFeeAmount = receiveAmountInfo && getOrderTypeReceiveAmounts(receiveAmountInfo).networkFeeAmount
  const partnerFee = receiveAmountInfo && receiveAmountInfo.costs.partnerFee
  const partnerFeeAmount = partnerFee?.amount
  const partnerFeeBps = partnerFee?.bps

  const partnerFeeUsd = useUsdAmount(partnerFeeAmount).value
  const networkFeeAmountUsd = useUsdAmount(networkFeeAmount).value

  return (
    <>
      {/*Partner fee*/}
      <PartnerFeeRow
        withTimelineDot={withTimelineDot}
        partnerFeeUsd={partnerFeeUsd}
        partnerFeeAmount={partnerFeeAmount}
        partnerFeeBps={partnerFeeBps}
        feeTooltipMarkdown={widgetParams.content?.feeTooltipMarkdown}
      />

      {/*Network cost*/}
      {networkFeeAmount?.greaterThan(0) && (
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
