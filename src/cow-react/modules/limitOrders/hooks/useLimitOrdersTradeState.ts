import { useAtomValue } from 'jotai/utils'
import { limitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { useTokenBySymbolOrAddress } from '@cow/common/hooks/useTokenBySymbolOrAddress'
import useCurrencyBalance from '@cow/modules/tokens/hooks/useCurrencyBalance'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { useSafeMemoObject } from '@cow/common/hooks/useSafeMemo'
import { useWalletInfo } from '@cow/modules/wallet'
import { TradeWidgetState } from '@cow/modules/trade/types/TradeWidgetState'
import { tryParseFractionalAmount } from '@cow/utils/tryParseFractionalAmount'

export interface LimitOrdersTradeState extends TradeWidgetState {
  readonly isUnlocked: boolean
}

export function useLimitOrdersTradeState(): LimitOrdersTradeState {
  const { account } = useWalletInfo()
  const state = useAtomValue(limitOrdersAtom)

  const recipient = state.recipient
  const orderKind = state.orderKind
  const isUnlocked = state.isUnlocked

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
    isUnlocked,
  })
}
