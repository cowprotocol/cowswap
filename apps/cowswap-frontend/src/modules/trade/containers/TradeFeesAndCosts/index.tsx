import { ReactNode } from 'react'

import { useUsdAmount } from 'modules/usdAmount'
import { useVolumeFeeTooltip } from 'modules/volumeFee'

import { NetworkCostsRow } from '../../pure/NetworkCostsRow'
import { TradeFees } from '../../pure/TradeFees'
import { ReceiveAmountInfo } from '../../types'
import { getOrderTypeReceiveAmounts } from '../../utils/getReceiveAmountInfo'
import { getTotalCosts } from '../../utils/getTotalCosts'

interface TradeFeesAndCostsProps {
  receiveAmountInfo: ReceiveAmountInfo | null
  networkCostsSuffix?: ReactNode
  networkCostsTooltipSuffix?: ReactNode
  withTimelineDot?: boolean
}

export function TradeFeesAndCosts(props: TradeFeesAndCostsProps): ReactNode {
  const { receiveAmountInfo, networkCostsSuffix, networkCostsTooltipSuffix, withTimelineDot = true } = props

  const networkFeeAmount = receiveAmountInfo && getOrderTypeReceiveAmounts(receiveAmountInfo).networkFeeAmount
  const partnerFee = receiveAmountInfo && receiveAmountInfo.costs.partnerFee
  const partnerFeeAmount = partnerFee?.amount
  const partnerFeeBps = partnerFee?.bps
  const protocolFee = receiveAmountInfo && receiveAmountInfo.costs.protocolFee
  const protocolFeeAmount = protocolFee?.amount
  const protocolFeeBps = protocolFee?.bps

  const partnerFeeUsd = useUsdAmount(partnerFeeAmount).value
  const protocolFeeUsd = useUsdAmount(protocolFeeAmount).value
  const networkFeeAmountUsd = useUsdAmount(networkFeeAmount).value

  const totalFeeAmount = receiveAmountInfo ? getTotalCosts(receiveAmountInfo) : null
  const totalFeeUsd = useUsdAmount(totalFeeAmount).value

  const volumeFeeTooltip = useVolumeFeeTooltip()

  return (
    <>
      <TradeFees
        partnerFeeAmount={partnerFeeAmount}
        partnerFeeUsd={partnerFeeUsd}
        partnerFeeBps={partnerFeeBps}
        protocolFeeAmount={protocolFeeAmount}
        protocolFeeUsd={protocolFeeUsd}
        protocolFeeBps={protocolFeeBps}
        totalFeeUsd={totalFeeUsd}
        volumeFeeTooltip={volumeFeeTooltip}
        withTimelineDot={withTimelineDot}
      />

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
