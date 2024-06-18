import { useMemo } from 'react'

import { FractionUtils } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'
import { RowFeeContent } from 'modules/trade'

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

  return <RowFeeContent {...props} feeIsApproximate />
}
