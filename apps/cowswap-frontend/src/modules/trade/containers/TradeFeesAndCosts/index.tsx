import { ReactNode } from 'react'

import { useUsdAmount } from 'modules/usdAmount'
import { useVolumeFeeTooltip } from 'modules/volumeFee'

import { FreeFeeRow } from '../../pure/FreeFeeRow'
import { NetworkCostsRow } from '../../pure/NetworkCostsRow'
import { PartnerFeeRow } from '../../pure/PartnerFeeRow'
import { ProtocolFeeRow } from '../../pure/ProtocolFeeRow'
import { TotalFeeRow } from '../../pure/TotalFeeRow'
import { ReceiveAmountInfo } from '../../types'
import { getOrderTypeReceiveAmounts, getTotalCosts } from '../../utils/getReceiveAmountInfo'

interface TradeFeesAndCostsProps {
  receiveAmountInfo: ReceiveAmountInfo | null
  networkCostsSuffix?: ReactNode
  networkCostsTooltipSuffix?: ReactNode
  withTimelineDot?: boolean
}

// eslint-disable-next-line complexity
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

  const hasPartnerFee = !!partnerFeeAmount && !!partnerFeeBps && !partnerFeeAmount.equalTo(0)
  const hasProtocolFee = !!protocolFeeAmount && !!protocolFeeBps && !protocolFeeAmount.equalTo(0)
  const hasAnyFee = hasPartnerFee || hasProtocolFee
  const hasBothFees = hasPartnerFee && hasProtocolFee

  const totalFeeAmount = receiveAmountInfo ? getTotalCosts(receiveAmountInfo) : null
  const totalFeeUsd = useUsdAmount(totalFeeAmount).value

  const volumeFeeTooltip = useVolumeFeeTooltip(false)

  const partnerFeeRow = (
    <PartnerFeeRow
      withTimelineDot={withTimelineDot}
      partnerFeeUsd={partnerFeeUsd}
      partnerFeeAmount={partnerFeeAmount}
      partnerFeeBps={partnerFeeBps}
      volumeFeeTooltip={volumeFeeTooltip}
    />
  )

  const protocolFeeRow = (
    <ProtocolFeeRow
      withTimelineDot={withTimelineDot}
      protocolFeeUsd={protocolFeeUsd}
      protocolFeeAmount={protocolFeeAmount}
      protocolFeeBps={protocolFeeBps}
    />
  )

  return (
    <>
      {/*If both fees exist: show Total fee first, then individual fees below*/}
      {hasBothFees && (
        <>
          <TotalFeeRow totalFeeUsd={totalFeeUsd} />
          {partnerFeeRow}
          {protocolFeeRow}
        </>
      )}

      {/*If only protocol fee: show protocol fee row*/}
      {!hasBothFees && hasProtocolFee && protocolFeeRow}

      {/*If only partner fee: show as Total fee (like before)*/}
      {!hasBothFees && hasPartnerFee && partnerFeeRow}

      {/*FREE - only if no fees at all*/}
      {!hasAnyFee && <FreeFeeRow withTimelineDot={withTimelineDot} />}

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
