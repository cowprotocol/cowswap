import { useAtomValue } from 'jotai/utils'
import { limitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useMemo } from 'react'
import { useTokenBySymbolOrAddress } from '@cow/common/hooks/useTokenBySymbolOrAddress'

export interface LimitOrdersTradeState {
  readonly inputCurrency: Currency | null
  readonly outputCurrency: Currency | null
  readonly inputCurrencyAmount: CurrencyAmount<Currency> | null
  readonly outputCurrencyAmount: CurrencyAmount<Currency> | null
  readonly recipient: string | null
  readonly deadline: number | null
}

export function useLimitOrdersTradeState(): LimitOrdersTradeState {
  const state = useAtomValue(limitOrdersAtom)

  const recipient = state.recipient
  const deadline = state.deadline
  const inputCurrency = useTokenBySymbolOrAddress(state.inputCurrencyId) || null
  const outputCurrency = useTokenBySymbolOrAddress(state.outputCurrencyId) || null
  const inputCurrencyAmount =
    tryParseCurrencyAmount(state.inputCurrencyAmount || undefined, inputCurrency || undefined) || null
  const outputCurrencyAmount =
    tryParseCurrencyAmount(state.outputCurrencyAmount || undefined, outputCurrency || undefined) || null

  return useMemo(() => {
    return {
      deadline,
      recipient,
      inputCurrency,
      outputCurrency,
      inputCurrencyAmount,
      outputCurrencyAmount,
    }
  }, [deadline, recipient, inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount])
}
