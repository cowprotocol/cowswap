import { ReactNode } from 'react'

import { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'

import { useUsdAmount } from 'modules/usdAmount'

import { NetworkCostsRow } from '../../pure/NetworkCostsRow'
import { PartnerFeeRow } from '../../pure/PartnerFeeRow'
import { ReceiveAmountInfo } from '../../types'
import { getOrderTypeReceiveAmounts } from '../../utils/getReceiveAmountInfo'

interface TradeFeesAndCostsProps {
  receiveAmountInfo: ReceiveAmountInfo | null
  widgetParams: Partial<CowSwapWidgetAppParams>
  networkCostsSuffix?: ReactNode
  networkCostsTooltipSuffix?: ReactNode
  withTimelineDot?: boolean
  alwaysRow?: boolean
}

export function TradeFeesAndCosts(props: TradeFeesAndCostsProps) {
  const {
    receiveAmountInfo,
    widgetParams,
    networkCostsSuffix,
    networkCostsTooltipSuffix,
    withTimelineDot = true,
    alwaysRow,
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
        alwaysRow={alwaysRow}
        withTimelineDot={withTimelineDot}
        partnerFeeUsd={partnerFeeUsd}
        partnerFeeAmount={partnerFeeAmount}
        partnerFeeBps={partnerFeeBps}
        widgetContent={widgetParams.content}
      />

      {/*Network cost*/}
      {networkFeeAmount?.greaterThan(0) && (
        <NetworkCostsRow
          networkFeeAmount={networkFeeAmount}
          networkFeeAmountUsd={networkFeeAmountUsd}
          withTimelineDot={withTimelineDot}
          alwaysRow={alwaysRow}
          amountSuffix={networkCostsSuffix}
          tooltipSuffix={networkCostsTooltipSuffix}
        />
      )}
    </>
  )
}
