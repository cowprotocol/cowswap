import { useAtomValue } from 'jotai/utils'
import { limitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useTokenBySymbolOrAddress } from '@cow/common/hooks/useTokenBySymbolOrAddress'
import { OrderKind } from '@cowprotocol/contracts'
import useCurrencyBalance from 'lib/hooks/useCurrencyBalance'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { useSafeMemoObject } from '@cow/common/hooks/useSafeMemo'
import { FractionUtils } from '@cow/utils/fractionUtils'
import { useWalletInfo } from '@cow/modules/wallet'

export interface LimitOrdersTradeState {
  readonly inputCurrency: Currency | null
  readonly outputCurrency: Currency | null
  readonly inputCurrencyAmount: CurrencyAmount<Currency> | null
  readonly outputCurrencyAmount: CurrencyAmount<Currency> | null
  readonly inputCurrencyBalance: CurrencyAmount<Currency> | null
  readonly outputCurrencyBalance: CurrencyAmount<Currency> | null
  readonly inputCurrencyFiatAmount: CurrencyAmount<Currency> | null
  readonly outputCurrencyFiatAmount: CurrencyAmount<Currency> | null
  readonly recipient: string | null
  readonly orderKind: OrderKind
  readonly isUnlocked: boolean
}

function tryParseFractionalAmount(currency: Currency | null, amount: string | null): CurrencyAmount<Currency> | null {
  if (!amount || !currency) return null

  try {
    const fraction = FractionUtils.parseFractionFromJSON(amount)

    if (!fraction) return null

    return currency ? CurrencyAmount.fromFractionalAmount(currency, fraction.numerator, fraction.denominator) : null
  } catch (e: any) {
    return null
  }
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
