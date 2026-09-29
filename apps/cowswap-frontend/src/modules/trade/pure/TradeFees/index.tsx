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
  testId?: string
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
  testId,
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
          testId={testId}
        />
        {partnerFeeRow}
      </>
    )
  }

  if (hasProtocolFee) return protocolFeeRow

  if (hasPartnerFee) return partnerFeeRow

  return <FreeFeeRow withTimelineDot={withTimelineDot} loading={loading} isLast={isLast} testId={testId} />
}
