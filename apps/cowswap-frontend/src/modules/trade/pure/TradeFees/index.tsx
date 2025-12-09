import { ReactElement } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { VolumeFeeTooltip } from 'modules/volumeFee'

import { FreeFeeRow } from '../FreeFeeRow'
import { PartnerFeeRow } from '../PartnerFeeRow'
import { ProtocolFeeRow } from '../ProtocolFeeRow'
import { TotalFeeRow } from '../TotalFeeRow'

interface TradeFeesProps {
  partnerFeeAmount: Nullish<CurrencyAmount<Currency>>
  partnerFeeUsd: Nullish<CurrencyAmount<Currency>>
  partnerFeeBps: number | undefined
  protocolFeeAmount: Nullish<CurrencyAmount<Currency>>
  protocolFeeUsd: Nullish<CurrencyAmount<Currency>>
  protocolFeeBps: number | undefined
  totalFeeUsd?: Nullish<CurrencyAmount<Currency>>
  volumeFeeTooltip: VolumeFeeTooltip
  withTimelineDot?: boolean
  loading?: boolean
  isLast?: boolean
}

export function TradeFees({
  partnerFeeAmount,
  partnerFeeUsd,
  partnerFeeBps,
  protocolFeeAmount,
  protocolFeeUsd,
  protocolFeeBps,
  totalFeeUsd,
  volumeFeeTooltip,
  withTimelineDot = true,
  loading,
  isLast = false,
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
    />
  )

  const protocolFeeRow = (
    <ProtocolFeeRow
      withTimelineDot={withTimelineDot}
      protocolFeeUsd={protocolFeeUsd}
      protocolFeeAmount={protocolFeeAmount}
      protocolFeeBps={protocolFeeBps}
      isLast={isLast && !hasPartnerFee}
    />
  )

  if (hasBothFees) {
    return (
      <>
        {totalFeeUsd ? <TotalFeeRow withTimelineDot={withTimelineDot} totalFeeUsd={totalFeeUsd} /> : null}
        <ProtocolFeeRow
          withTimelineDot={withTimelineDot}
          protocolFeeUsd={protocolFeeUsd}
          protocolFeeAmount={protocolFeeAmount}
          protocolFeeBps={protocolFeeBps}
        />
        {partnerFeeRow}
      </>
    )
  }

  if (hasProtocolFee) return protocolFeeRow

  if (hasPartnerFee) return partnerFeeRow

  return <FreeFeeRow withTimelineDot={withTimelineDot} loading={loading} isLast={isLast} />
}
