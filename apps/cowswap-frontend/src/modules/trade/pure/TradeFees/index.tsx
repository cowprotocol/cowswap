import { ReactElement } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { Nullish } from 'types'

import { VolumeFeeTooltip } from 'modules/volumeFee'

import { FreeFeeRow } from '../FreeFeeRow'
import { PartnerFeeRow } from '../PartnerFeeRow'
import { ProtocolFeeRow } from '../ProtocolFeeRow'

interface TradeFeesProps {
  partnerFeeAmount: Nullish<CurrencyAmount<Currency>>
  partnerFeeUsd: Nullish<CurrencyAmount<Currency>>
  partnerFeeBps: number | undefined
  protocolFeeAmount: Nullish<CurrencyAmount<Currency>>
  protocolFeeUsd: Nullish<CurrencyAmount<Currency>>
  protocolFeeBps: number | undefined
  volumeFeeTooltip: VolumeFeeTooltip
  withTimelineDot?: boolean
  loading?: boolean
  isLast?: boolean
  /** Limit form detail-row typography (medium label, secondary value). */
  detailRowStyle?: boolean
  testId?: string
  /** Defaults to true. When false, no fee row is rendered instead of the FREE one. */
  isFreePlacement?: boolean
}

export function TradeFees({
  partnerFeeAmount,
  partnerFeeUsd,
  partnerFeeBps,
  protocolFeeAmount,
  protocolFeeUsd,
  protocolFeeBps,
  volumeFeeTooltip,
  withTimelineDot = true,
  loading,
  isLast = false,
  detailRowStyle = false,
  testId,
  isFreePlacement = true,
}: TradeFeesProps): ReactElement | null {
  const hasPartnerFee = !!partnerFeeAmount && !!partnerFeeBps && !partnerFeeAmount.equalTo(0)
  const hasProtocolFee = !!protocolFeeAmount && !!protocolFeeBps && !protocolFeeAmount.equalTo(0)
  const hasBothFees = hasPartnerFee && hasProtocolFee

  const partnerFeeRow = (
    <PartnerFeeRow
      withTimelineDot={withTimelineDot}
      partnerFeeUsd={partnerFeeUsd}
      partnerFeeAmount={partnerFeeAmount}
      partnerFeeBps={partnerFeeBps}
      volumeFeeTooltip={volumeFeeTooltip}
      isLast={isLast}
      loading={loading}
      detailRowStyle={detailRowStyle}
      testId={testId}
    />
  )

  const protocolFeeRow = (
    <ProtocolFeeRow
      withTimelineDot={withTimelineDot}
      protocolFeeUsd={protocolFeeUsd}
      protocolFeeAmount={protocolFeeAmount}
      protocolFeeBps={protocolFeeBps}
      isLast={isLast && !hasPartnerFee}
      loading={loading}
      detailRowStyle={detailRowStyle}
      testId={testId}
    />
  )

  if (hasBothFees) {
    return (
      <>
        <ProtocolFeeRow
          withTimelineDot={withTimelineDot}
          protocolFeeUsd={protocolFeeUsd}
          protocolFeeAmount={protocolFeeAmount}
          protocolFeeBps={protocolFeeBps}
          loading={loading}
          detailRowStyle={detailRowStyle}
          testId={testId}
        />
        {partnerFeeRow}
      </>
    )
  }

  if (hasProtocolFee) return protocolFeeRow

  if (hasPartnerFee) return partnerFeeRow

  if (!isFreePlacement) return null

  return (
    <FreeFeeRow
      withTimelineDot={withTimelineDot}
      loading={loading}
      isLast={isLast}
      detailRowStyle={detailRowStyle}
      testId={testId}
    />
  )
}
