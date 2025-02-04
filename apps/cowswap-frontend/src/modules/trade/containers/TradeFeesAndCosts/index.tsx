import { ReactNode } from 'react'

import { useUsdAmount } from 'modules/usdAmount'
import { VolumeFeeTooltip } from 'modules/volumeFee'

import { NetworkCostsRow } from '../../pure/NetworkCostsRow'
import { PartnerFeeRow } from '../../pure/PartnerFeeRow'
import { ReceiveAmountInfo } from '../../types'
import { getOrderTypeReceiveAmounts } from '../../utils/getReceiveAmountInfo'

interface TradeFeesAndCostsProps {
  receiveAmountInfo: ReceiveAmountInfo | null
  networkCostsSuffix?: ReactNode
  networkCostsTooltipSuffix?: ReactNode
  withTimelineDot?: boolean

  volumeFeeTooltip: VolumeFeeTooltip
}

export function TradeFeesAndCosts(props: TradeFeesAndCostsProps) {
  const {
    receiveAmountInfo,
    networkCostsSuffix,
    networkCostsTooltipSuffix,
    withTimelineDot = true,

    volumeFeeTooltip,
  } = props

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
