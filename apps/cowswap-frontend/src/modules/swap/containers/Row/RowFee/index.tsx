import { useMemo } from 'react'

import { FractionUtils, bpsToPercent, formatPercent } from '@cowprotocol/common-utils'
import { PartnerFee } from '@cowprotocol/widget-lib'
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'

import ReactMarkdown, { Components } from 'react-markdown'

import { markdownComponents } from 'legacy/components/Markdown/components'
import TradeGp from 'legacy/state/swap/TradeGp'

import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'
import { RowFeeContent } from 'modules/swap/pure/Row/RowFeeContent'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

const tooltipNetworkCosts = (props: { isPresign: boolean; ethFlow: boolean; nativeSymbol?: string }) => {
  const { isPresign, ethFlow, nativeSymbol = 'a native currency' } = props
  const requireGas = isPresign || ethFlow

  return (
    <>
      This is the cost of settling your order on-chain
      {!requireGas && ', including gas and any LP fees'}.
      <br />
      <br />
      CoW Swap will try to lower this cost where possible.
      {(isPresign || ethFlow) && (
        <>
          <br />
          <br />
        </>
      )}
      {isPresign && 'Because you are using a smart contract wallet'}
      {ethFlow && `Because you are selling ${nativeSymbol} (native currency)`}
      {(isPresign || ethFlow) && ', you will pay a separate gas cost for signing the order placement on-chain.'}
    </>
  )
}

const TOOLTIP_PARTNER_FEE_FREE = `Unlike other exchanges, CoW Swap doesn’t charge a fee for trading!`

const tooltipPartnerFee = (bps: number) => (
  <>
    This fee helps pay for maintenance & improvements to the swap experience.
    <br />
    <br />
    The fee is {bps} BPS ({formatPercent(bpsToPercent(bps))}%), applied only if the trade is executed.
  </>
)

// computes price breakdown for the trade
function computeTradePriceBreakdown(trade?: TradeGp | null): {
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

export function RowNetworkCosts({ trade, feeAmount, feeInFiat, allowsOffchainSigning, noLabel }: RowNetworkCostsProps) {
  const { realizedFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])

  const isEoaEthFlow = useIsEoaEthFlow()
  const native = useNativeCurrency()

  // trades are null when there is a fee quote error e.g
  // so we can take both
  const isPresign = !isEoaEthFlow && !allowsOffchainSigning

  const props = useMemo(() => {
    const tooltip = tooltipNetworkCosts({
      ethFlow: isEoaEthFlow,
      isPresign,
      nativeSymbol: native.symbol,
    })
    const displayFee = realizedFee || feeAmount
    const isFree = !displayFee || FractionUtils.lte(displayFee, 0)

    const requireGas = isEoaEthFlow || isPresign

    return {
      label: 'Network costs (est.)',
      tooltip,
      feeAmount: displayFee,
      feeInFiat,
      isFree,
      noLabel,
      requireGas,
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
