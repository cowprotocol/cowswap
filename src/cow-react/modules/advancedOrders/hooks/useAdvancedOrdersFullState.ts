import { useWalletInfo } from '@cow/modules/wallet'
import { useTokenBySymbolOrAddress } from '@cow/common/hooks/useTokenBySymbolOrAddress'
import useCurrencyBalance from '@cow/modules/tokens/hooks/useCurrencyBalance'
import { useHigherUSDValue } from '@src/hooks/useStablecoinPrice'
import { useSafeMemoObject } from '@cow/common/hooks/useSafeMemo'
import { useAdvancedOrdersRawState } from '@cow/modules/advancedOrders'
import { TradeFullState } from '@cow/modules/trade/types/TradeFullState'
import { tryParseFractionalAmount } from '@cow/utils/tryParseFractionalAmount'

export function useAdvancedOrdersFullState(): TradeFullState {
  const { account } = useWalletInfo()
  const state = useAdvancedOrdersRawState()

  const recipient = state.recipient
  const orderKind = state.orderKind

  const inputCurrency = useTokenBySymbolOrAddress(state.inputCurrencyId)
  const outputCurrency = useTokenBySymbolOrAddress(state.outputCurrencyId)
  const inputCurrencyAmount = tryParseFractionalAmount(inputCurrency, state.inputCurrencyAmount)
  const outputCurrencyAmount = tryParseFractionalAmount(outputCurrency, state.outputCurrencyAmount)
  const inputCurrencyBalance = useCurrencyBalance(account, inputCurrency) || null
  const outputCurrencyBalance = useCurrencyBalance(account, outputCurrency) || null
  const inputCurrencyFiatAmount = useHigherUSDValue(inputCurrencyAmount || undefined)
  const outputCurrencyFiatAmount = useHigherUSDValue(outputCurrencyAmount || undefined)

  return useSafeMemoObject({
    orderKind,
    recipient,
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    inputCurrencyBalance,
    outputCurrencyBalance,
    inputCurrencyFiatAmount,
    outputCurrencyFiatAmount,
  })
}
