import { useMemo } from 'react'

import { FractionUtils, bpsToPercent, formatFiatAmount, formatPercent, formatSymbol, formatTokenAmount } from '@cowprotocol/common-utils'
import { UI } from '@cowprotocol/ui'
import { PartnerFee } from '@cowprotocol/widget-lib'
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'

import ReactMarkdown, { Components } from 'react-markdown'
import styled from 'styled-components/macro'

import { markdownComponents } from 'legacy/components/Markdown/components'
import TradeGp from 'legacy/state/swap/TradeGp'

import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'
import { RowFeeContent } from 'modules/swap/pure/Row/RowFeeContent'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

export const tooltipNetworkCosts = (props: { isPresign: boolean; ethFlow: boolean; nativeSymbol?: string }) => {
  const { isPresign, ethFlow, nativeSymbol = 'a native currency' } = props
  const requireGas = isPresign || ethFlow

  return (
    <>
      This is the cost of settling your order on-chain
      {!requireGas && ', including gas and any LP fees'}.
      <br />
      <br />
      CoW Swap will try to lower this cost where possible.
      {(isPresign || ethFlow) && <><br /><br /></>}
      {isPresign && 'Because you are using a smart contract wallet'}
      {ethFlow && `Because you are selling ${nativeSymbol} (native currency)`}
      {(isPresign || ethFlow) && ', you will pay a separate gas cost for signing the order placement on-chain.'}
    </>
  )
}

const TOOLTIP_PARTNER_FEE_FREE = `Unlike other exchanges, CoW Swap doesn’t charge a fee for trading!`

export const PlusGas = styled.span`
  color: var(${UI.COLOR_TEXT2});
  font-size: 11px;
  font-weight: 400;
`

const labelWithPlusGas = (label: string, plusGas?: boolean) => (
  <>
    {label}
    {plusGas && <PlusGas>&nbsp;+ gas</PlusGas>}
  </>
)

export const tooltipPartnerFee = (bps: number) => (
  <>
    This fee helps pay for maintenance & improvements to the swap experience.
    <br />
    <br />
    The fee is {bps} BPS ({formatPercent(bpsToPercent(bps))}%), applied only if the trade is executed.
  </>
)

// computes price breakdown for the trade
export function computeTradePriceBreakdown(trade?: TradeGp | null): {
  realizedFee: CurrencyAmount<Currency> | undefined | null
} {
  // This is needed because we are using Uniswap pools for the price calculation,
  // thus, we need to account for the LP fees the same way as Uniswap does.
  // const { priceImpactWithoutFee } = computeTradePriceBreakdownUni(trade)

  return {
    realizedFee:
      trade?.tradeType === TradeType.EXACT_INPUT
        ? trade?.outputAmountWithoutFee?.subtract(trade.outputAmount)
        : trade?.fee?.feeAsCurrency,
  }
}

export interface RowNetworkCostsProps {
  // Although fee is part of the trade, if the trade is invalid, then it will be undefined
  // Even for invalid trades, we want to display the fee, this is why there's another "fee" parameter
  trade?: TradeGp
  feeAmount?: CurrencyAmount<Currency>
  feeInFiat: CurrencyAmount<Token> | null
  allowsOffchainSigning: boolean
  noLabel?: boolean
}

function isValidNonZeroAmount(value: string): boolean {
  const fee = Number(value)

  if (Number.isNaN(fee)) {
    return value.length > 0
  } else {
    return fee > 0
  }
}

export function RowNetworkCosts({ trade, feeAmount, feeInFiat, allowsOffchainSigning, noLabel }: RowNetworkCostsProps) {
  const { realizedFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])

  const isEoaEthFlow = useIsEoaEthFlow()
  const native = useNativeCurrency()

  // trades are null when there is a fee quote error e.g
  // so we can take both
  const isPresign = !isEoaEthFlow && !allowsOffchainSigning
  const props = useMemo(() => {
    const label = 'Network costs (est.)'
    const tooltip = tooltipNetworkCosts({
      ethFlow: isEoaEthFlow,
      isPresign,
      nativeSymbol: native.symbol,
    })
    const displayFee = realizedFee || feeAmount
    const feeCurrencySymbol = displayFee?.currency.symbol || '-'
    // TODO: delegate formatting to the view layer
    const feeInFiatFormatted = formatFiatAmount(feeInFiat)
    const displayFeeFormatted = formatTokenAmount(displayFee)
    const feeAmountWithCurrency = `${displayFeeFormatted} ${formatSymbol(feeCurrencySymbol)}`

    const isFree = !isValidNonZeroAmount(displayFeeFormatted)

    const requireGas = isEoaEthFlow || isPresign
    const feeToken = labelWithPlusGas(isFree ? 'FREE' : '≈ ' + feeAmountWithCurrency, requireGas)
    const feeUsd = isValidNonZeroAmount(feeInFiatFormatted) ? `(≈$${feeInFiatFormatted})` : ''

    const fullDisplayFee = FractionUtils.fractionLikeToExactString(displayFee) || '-'

    return {
      label,
      feeToken,
      feeUsd,
      isFree,
      fullDisplayFee,
      feeCurrencySymbol,
      tooltip,
      noLabel,
    }
  }, [feeAmount, feeInFiat, isEoaEthFlow, realizedFee, native, noLabel, isPresign])

  return <RowFeeContent {...props} />
}

export interface PartnerRowPartnerFeeProps {
  partnerFee?: PartnerFee
  feeAmount?: CurrencyAmount<Currency>
  feeInFiat: CurrencyAmount<Token> | null
  label?: string
  tooltipMarkdown?: string
}

export function RowPartnerFee({ partnerFee, feeAmount, feeInFiat, label, tooltipMarkdown }: PartnerRowPartnerFeeProps) {
  const props = useMemo(() => {
    const feeCurrencySymbol = feeAmount?.currency.symbol || '-' // TODO: Once we implement the computation of the fee, we should express it in the relevant fee currency (buy token for sell orders)
    const feeInFiatFormatted = formatFiatAmount(feeInFiat)
    const displayFeeFormatted = formatTokenAmount(feeAmount)
    const feeAmountWithCurrency = `${displayFeeFormatted} ${formatSymbol(feeCurrencySymbol)}`

    const feeUsd = isValidNonZeroAmount(feeInFiatFormatted) ? feeInFiatFormatted && `(≈$${feeInFiatFormatted})` : ''
    const fullDisplayFee = FractionUtils.fractionLikeToExactString(feeAmount) || '-'
    const { bps } = partnerFee || { bps: 0 }
    const isFree = bps === 0

    const markdownContent = tooltipMarkdown ? <ReactMarkdown components={markdownComponents as Components}>{tooltipMarkdown}</ReactMarkdown> : undefined

    return {
      label: label ? label : isFree ? 'Fee' : 'Total fee',
      feeToken: isFree ? 'FREE' : feeAmountWithCurrency,
      feeUsd,
      fullDisplayFee,
      feeCurrencySymbol,
      isFree,
      tooltip: markdownContent ? markdownContent : isFree ? TOOLTIP_PARTNER_FEE_FREE : tooltipPartnerFee(bps),
    }
  }, [partnerFee, feeAmount, feeInFiat, label, tooltipMarkdown])

  return <RowFeeContent {...props} />
}
