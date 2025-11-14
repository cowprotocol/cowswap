import { ReactNode } from 'react'

import { Trans, useLingui } from '@lingui/react/macro'

import { useUsdAmount } from 'modules/usdAmount'
import { useVolumeFeeTooltip } from 'modules/volumeFee'

import { NetworkCostsRow } from '../../pure/NetworkCostsRow'
import { PartnerFeeRow } from '../../pure/PartnerFeeRow'
import { ProtocolFeeRow } from '../../pure/ProtocolFeeRow'
import { ReviewOrderModalAmountRow } from '../../pure/ReviewOrderModalAmountRow'
import { ReceiveAmountInfo } from '../../types'
import { getOrderTypeReceiveAmounts } from '../../utils/getReceiveAmountInfo'
import * as styledEl from '../TradeBasicConfirmDetails/styled'

interface TradeFeesAndCostsProps {
  receiveAmountInfo: ReceiveAmountInfo | null
  networkCostsSuffix?: ReactNode
  networkCostsTooltipSuffix?: ReactNode
  withTimelineDot?: boolean
}

// todo fix it
// eslint-disable-next-line complexity
export function TradeFeesAndCosts(props: TradeFeesAndCostsProps): ReactNode {
  const { receiveAmountInfo, networkCostsSuffix, networkCostsTooltipSuffix, withTimelineDot = true } = props

  const volumeFeeTooltip = useVolumeFeeTooltip()
  const { t } = useLingui()

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

  return (
    <>
      {/*Protocol fee*/}
      {hasProtocolFee && (
        <ProtocolFeeRow
          withTimelineDot={withTimelineDot}
          protocolFeeUsd={protocolFeeUsd}
          protocolFeeAmount={protocolFeeAmount}
          protocolFeeBps={protocolFeeBps}
        />
      )}

      {/*Partner fee*/}
      {hasPartnerFee && (
        <PartnerFeeRow
          withTimelineDot={withTimelineDot}
          partnerFeeUsd={partnerFeeUsd}
          partnerFeeAmount={partnerFeeAmount}
          partnerFeeBps={partnerFeeBps}
          volumeFeeTooltip={volumeFeeTooltip}
        />
      )}

      {/*FREE - only if no fees at all*/}
      {!hasAnyFee && (
        <ReviewOrderModalAmountRow
          withTimelineDot={withTimelineDot}
          tooltip={t`No fee for order placement!`}
          label={t`Fee`}
        >
          <styledEl.GreenText>
            <Trans>FREE</Trans>
          </styledEl.GreenText>
        </ReviewOrderModalAmountRow>
      )}

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
