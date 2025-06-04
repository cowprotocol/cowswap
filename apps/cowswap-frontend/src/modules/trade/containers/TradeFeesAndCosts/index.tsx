import { ReactNode } from 'react'

import { useUsdAmount } from 'modules/usdAmount'
import { useVolumeFeeTooltip } from 'modules/volumeFee'

import { NetworkCostsRow } from '../../pure/NetworkCostsRow'
import { PartnerFeeRow } from '../../pure/PartnerFeeRow'
import { ReceiveAmountInfo } from '../../types'
import { getOrderTypeReceiveAmounts } from '../../utils/getReceiveAmountInfo'

interface TradeFeesAndCostsProps {
  receiveAmountInfo: ReceiveAmountInfo | null
  networkCostsSuffix?: ReactNode
  networkCostsTooltipSuffix?: ReactNode
  withTimelineDot?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradeFeesAndCosts(props: TradeFeesAndCostsProps) {
  const { receiveAmountInfo, networkCostsSuffix, networkCostsTooltipSuffix, withTimelineDot = true } = props

  const volumeFeeTooltip = useVolumeFeeTooltip()

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
        volumeFeeTooltip={volumeFeeTooltip}
      />

      {/*Network cost*/}
      {networkFeeAmount?.greaterThan(0) && (
        <NetworkCostsRow
          networkFeeAmount={networkFeeAmount}
          networkFeeAmountUsd={networkFeeAmountUsd}
          withTimelineDot={withTimelineDot}
          amountSuffix={networkCostsSuffix}
          tooltipSuffix={networkCostsTooltipSuffix}
        />
      )}
    </>
  )
}
