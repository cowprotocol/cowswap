import { useMemo } from 'react'
import { CurrencyAmount, Currency, TradeType, Token } from '@uniswap/sdk-core'

import { formatMax, formatSmart } from 'utils/format'
import TradeGp from 'state/swap/TradeGp'
import { AMOUNT_PRECISION, FIAT_PRECISION } from 'constants/index'
import { RowFeeContent } from '@cow/modules/swap/pure/Row/RowFeeContent'
import { RowWithShowHelpersProps } from '@cow/modules/swap/pure/Row/types'

export const GASLESS_FEE_TOOLTIP_MSG =
  'On CoW Swap you sign your order (hence no gas costs!). The fees are covering your gas costs already.'

export const PRESIGN_FEE_TOOLTIP_MSG =
  'These fees cover the gas costs for executing the order once it has been placed. However - since you are using a smart contract wallet - you will need to pay the gas for signing an on-chain tx in order to place it.'

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

export interface RowFeeProps extends RowWithShowHelpersProps {
  // Although fee is part of the trade, if the trade is invalid, then it will be undefined
  // Even for invalid trades, we want to display the fee, this is why there's another "fee" parameter
  trade?: TradeGp
  fee?: CurrencyAmount<Currency>
  feeFiatValue: CurrencyAmount<Token> | null
  allowsOffchainSigning: boolean
}

export function RowFee({ trade, fee, feeFiatValue, allowsOffchainSigning, showHelpers }: RowFeeProps) {
  const { realizedFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  // trades are null when there is a fee quote error e.g
  // so we can take both
  const props = useMemo(() => {
    const displayFee = realizedFee || fee
    const feeCurrencySymbol = displayFee?.currency.symbol || '-'
    const smartFeeFiatValue = formatSmart(feeFiatValue, FIAT_PRECISION)
    const smartFeeTokenValue = formatSmart(displayFee, AMOUNT_PRECISION)
    const feeToken = smartFeeTokenValue ? `${smartFeeTokenValue} ${feeCurrencySymbol}` : '🎉 Free!'
    const fullDisplayFee = formatMax(displayFee, displayFee?.currency.decimals) || '-'
    const includeGasMessage = allowsOffchainSigning ? ' (incl. gas costs)' : ''
    const tooltip = allowsOffchainSigning ? GASLESS_FEE_TOOLTIP_MSG : PRESIGN_FEE_TOOLTIP_MSG

    return {
      showHelpers,
      feeToken,
      feeUsd: smartFeeFiatValue && `(≈$${smartFeeFiatValue})`,
      fullDisplayFee,
      feeCurrencySymbol,
      includeGasMessage,
      tooltip,
    }
  }, [allowsOffchainSigning, fee, feeFiatValue, realizedFee, showHelpers])

  return <RowFeeContent {...props} />
}
