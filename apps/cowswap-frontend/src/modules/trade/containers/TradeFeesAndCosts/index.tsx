import { ReactNode } from 'react'

import { useUsdAmount } from 'modules/usdAmount'
import { useVolumeFeeTooltip } from 'modules/volumeFee'

import { NetworkCostsRow } from '../../pure/NetworkCostsRow'
import { TradeFees } from '../../pure/TradeFees'
import { ReceiveAmountInfo } from '../../types'
import { getOrderTypeReceiveAmounts } from '../../utils/getOrderTypeReceiveAmounts'

interface TradeFeesAndCostsProps {
  receiveAmountInfo: ReceiveAmountInfo | null
  networkCostsSuffix?: ReactNode
  networkCostsTooltipSuffix?: ReactNode
  withTimelineDot?: boolean
  /** Overrides the fee row's default `confirmOrderAmount` test hook. */
  feeTestId?: string
  /** Overrides the network-costs row's default `confirmOrderAmount` test hook. */
  networkCostsTestId?: string
}

export function TradeFeesAndCosts(props: TradeFeesAndCostsProps): ReactNode {
  const {
    receiveAmountInfo,
    networkCostsSuffix,
    networkCostsTooltipSuffix,
    withTimelineDot = true,
    feeTestId,
    networkCostsTestId,
  } = props

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

  const volumeFeeTooltip = useVolumeFeeTooltip()

  const hasNetworkCosts = networkFeeAmount?.greaterThan(0)

  return (
    <>
      <TradeFees
        partnerFeeAmount={partnerFeeAmount}
        partnerFeeUsd={partnerFeeUsd}
        partnerFeeBps={partnerFeeBps}
        protocolFeeAmount={protocolFeeAmount}
        protocolFeeUsd={protocolFeeUsd}
        protocolFeeBps={protocolFeeBps}
        volumeFeeTooltip={volumeFeeTooltip}
        withTimelineDot={withTimelineDot}
        isLast={!hasNetworkCosts}
        testId={feeTestId}
      />

      {hasNetworkCosts && networkFeeAmount && (
        <NetworkCostsRow
          networkFeeAmount={networkFeeAmount}
          networkFeeAmountUsd={networkFeeAmountUsd}
          withTimelineDot={withTimelineDot}
          amountSuffix={networkCostsSuffix}
          tooltipSuffix={networkCostsTooltipSuffix}
          isLast
          testId={networkCostsTestId}
        />
      )}
    </>
  )
}
