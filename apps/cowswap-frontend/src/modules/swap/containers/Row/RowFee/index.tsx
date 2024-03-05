import { useMemo } from 'react'

import { bpsToPercent, formatFiatAmount, formatTokenAmount } from '@cowprotocol/common-utils'
import { FractionUtils, formatPercent, formatSymbol } from '@cowprotocol/common-utils'
import { PartnerFee } from '@cowprotocol/widget-lib'
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'
import { RowFeeContent } from 'modules/swap/pure/Row/RowFeeContent'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

export const GASLESS_FEE_TOOLTIP_MSG = (
  <>
    This covers the cost of executing your trade, including gas and any LP fees.
    <br />
    <br />
    CoW Swap will try to lower this cost when possible
  </>
)

export const PRESIGN_FEE_TOOLTIP_MSG =
  'These fees cover the gas costs for executing the order once it has been placed. However - since you are using a smart contract wallet - you will need to pay the gas for signing an on-chain tx in order to place it.'

const getEthFlowFeeTooltipMsg = (native = 'a native currency') =>
  `Trades on CoW Swap usually don’t require you to pay gas in ${native}. However, when selling ${native}, you do have to pay a small gas fee to cover the cost of wrapping your ${native}.`

const TOTAL_FEE_TOOLTIP_FREE = `Unlike other exchanges, CoW Swap doesn’t charge a fee for trading!`

export const getTotalFeeTooltip = (bps: number) => (
  <>
    This fee helps pay for maintenance & improvements to the swap experience.
    <br />
    <br />
    The fee is {bps} BPS (${formatPercent(bpsToPercent(bps))}%), applied only if the trade is executed.
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

  const tooltip = useMemo(() => {
    if (isEoaEthFlow) {
      return getEthFlowFeeTooltipMsg(native.symbol)
    } else if (allowsOffchainSigning) {
      return GASLESS_FEE_TOOLTIP_MSG
    } else {
      return PRESIGN_FEE_TOOLTIP_MSG
    }
  }, [allowsOffchainSigning, isEoaEthFlow, native.symbol])

  // trades are null when there is a fee quote error e.g
  // so we can take both
  const props = useMemo(() => {
    const label = 'Network costs (est.)'
    const displayFee = realizedFee || feeAmount
    const feeCurrencySymbol = displayFee?.currency.symbol || '-'
    // TODO: delegate formatting to the view layer
    const feeInFiatFormatted = formatFiatAmount(feeInFiat)
    const displayFeeFormatted = formatTokenAmount(displayFee)
    const feeAmountWithCurrency = `${displayFeeFormatted} ${formatSymbol(feeCurrencySymbol)} ${
      isEoaEthFlow ? ' + gas' : ''
    }`

    const isFree = !isValidNonZeroAmount(displayFeeFormatted)

    const feeToken = isFree ? `FREE${isEoaEthFlow ? ' (+ gas)' : ''}` : '≈ ' + feeAmountWithCurrency
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
  }, [feeAmount, feeInFiat, isEoaEthFlow, realizedFee, tooltip, noLabel])

  return <RowFeeContent {...props} />
}

export interface PartnerRowPartnerFeeProps {
  partnerFee?: PartnerFee
  feeAmount?: CurrencyAmount<Currency>
  feeInFiat: CurrencyAmount<Token> | null
}

export function RowPartnerFee({ partnerFee, feeAmount, feeInFiat }: PartnerRowPartnerFeeProps) {
  const props = useMemo(() => {
    const feeCurrencySymbol = feeAmount?.currency.symbol || '-' // TODO: Once we implement the computation of the fee, we should express it in the relevant fee currency (buy token for sell orders)
    const feeInFiatFormatted = formatFiatAmount(feeInFiat)
    const displayFeeFormatted = formatTokenAmount(feeAmount)
    const feeAmountWithCurrency = `${displayFeeFormatted} ${formatSymbol(feeCurrencySymbol)}`

    const feeUsd = isValidNonZeroAmount(feeInFiatFormatted) ? feeInFiatFormatted && `(≈$${feeInFiatFormatted})` : ''
    const fullDisplayFee = FractionUtils.fractionLikeToExactString(feeAmount) || '-'
    const { bps } = partnerFee || { bps: 0 }
    const isFree = bps === 0

    return {
      label: isFree ? 'Fee' : 'Total fee',
      feeToken: isFree ? 'FREE' : feeAmountWithCurrency,
      feeUsd,
      fullDisplayFee,
      feeCurrencySymbol,
      isFree,
      tooltip: isFree ? TOTAL_FEE_TOOLTIP_FREE : getTotalFeeTooltip(bps),
    }
  }, [partnerFee, feeAmount, feeInFiat])

  return <RowFeeContent {...props} />
}
