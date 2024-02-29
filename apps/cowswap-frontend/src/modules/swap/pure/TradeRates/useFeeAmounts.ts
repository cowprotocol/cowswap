import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

import { useUsdAmount } from 'modules/usdAmount'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

export function useFeeAmounts(trade: TradeGp | undefined, fee: CurrencyAmount<Currency> | null) {
  const feeFiatValue = useUsdAmount(fee).value
  const partnerFeeFiatValue = useUsdAmount(trade?.partnerFeeAmount).value

  const feeTotalAmount = useSafeMemo(() => {
    if (!trade || !fee) return null

    const isExactInput = trade.tradeType === TradeType.EXACT_INPUT
    const feeAsCurrency = isExactInput ? trade.executionPrice.quote(fee) : fee

    return trade.partnerFeeAmount ? trade.partnerFeeAmount.add(feeAsCurrency) : feeAsCurrency
  }, [trade, fee])

  const feeUsdTotalAmount = useSafeMemo(() => {
    return partnerFeeFiatValue && feeFiatValue ? partnerFeeFiatValue.add(feeFiatValue) : feeFiatValue
  }, [partnerFeeFiatValue, feeFiatValue])

  return { feeTotalAmount, feeUsdTotalAmount }
}
