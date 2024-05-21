import { useMemo } from 'react'

import { bpsToPercent, formatPercent } from '@cowprotocol/common-utils'
import type { PartnerFee } from '@cowprotocol/widget-lib'
import type { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import ReactMarkdown, { Components } from 'react-markdown'

import { markdownComponents } from 'legacy/components/Markdown/components'

import { RowFeeContent } from '../RowFeeContent'

const TOOLTIP_PARTNER_FEE_FREE = `Unlike other exchanges, CoW Swap doesn’t charge a fee for trading!`

const tooltipPartnerFee = (bps: number) => (
  <>
    This fee helps pay for maintenance & improvements to the swap experience.
    <br />
    <br />
    The fee is {bps} BPS ({formatPercent(bpsToPercent(bps))}%), applied only if the trade is executed.
  </>
)

export interface PartnerRowPartnerFeeProps {
  partnerFee?: PartnerFee
  feeAmount?: CurrencyAmount<Currency> | null
  feeInFiat: CurrencyAmount<Token> | null
  label?: string
  tooltipMarkdown?: string
}

export function RowPartnerFee({ partnerFee, feeAmount, feeInFiat, label, tooltipMarkdown }: PartnerRowPartnerFeeProps) {
  const props = useMemo(() => {
    const { bps } = partnerFee || { bps: 0 }
    const isFree = bps === 0

    const markdownContent = tooltipMarkdown ? (
      <ReactMarkdown components={markdownComponents as Components}>{tooltipMarkdown}</ReactMarkdown>
    ) : undefined

    return {
      label: label ? label : isFree ? 'Fee' : 'Total fee',
      tooltip: markdownContent || (isFree ? TOOLTIP_PARTNER_FEE_FREE : tooltipPartnerFee(bps)),
      feeAmount,
      feeInFiat,
      isFree,
    }
  }, [partnerFee, feeAmount, feeInFiat, label, tooltipMarkdown])

  return <RowFeeContent {...props} />
}
