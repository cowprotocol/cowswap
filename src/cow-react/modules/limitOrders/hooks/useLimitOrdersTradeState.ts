import { useWeb3React } from '@web3-react/core'
import { useAtomValue } from 'jotai/utils'
import { limitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useTokenBySymbolOrAddress } from '@cow/common/hooks/useTokenBySymbolOrAddress'
import { OrderKind } from '@cowprotocol/contracts'
import useCurrencyBalance from 'lib/hooks/useCurrencyBalance'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { useSafeMemoObject } from '@cow/common/hooks/useSafeMemo'
import { limitOrdersSettingsAtom } from '@cow/modules/limitOrders/state/limitOrdersSettingsAtom'
import { calculateValidTo } from '@cow/utils/time'
import { Timestamp } from '@cow/types'

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
  readonly deadlineTimestamp: Timestamp | null
  readonly orderKind: OrderKind
  readonly isUnlocked: boolean
}

export function useLimitOrdersTradeState(): LimitOrdersTradeState {
  const { account } = useWeb3React()
  const state = useAtomValue(limitOrdersAtom)
  const settingsState = useAtomValue(limitOrdersSettingsAtom)

  const recipient = state.recipient
  const orderKind = state.orderKind
  const isUnlocked = state.isUnlocked
  const deadlineTimestamp = settingsState.customDeadlineTimestamp
    ? settingsState.customDeadlineTimestamp
    : calculateValidTo(settingsState.deadlineMilliseconds / 1000)

  const inputCurrency = useTokenBySymbolOrAddress(state.inputCurrencyId)
  const outputCurrency = useTokenBySymbolOrAddress(state.outputCurrencyId)
  const inputCurrencyAmount =
    tryParseCurrencyAmount(state.inputCurrencyAmount || undefined, inputCurrency || undefined) || null
  const outputCurrencyAmount =
    tryParseCurrencyAmount(state.outputCurrencyAmount || undefined, outputCurrency || undefined) || null
  const inputCurrencyBalance = useCurrencyBalance(account, inputCurrency) || null
  const outputCurrencyBalance = useCurrencyBalance(account, outputCurrency) || null
  const inputCurrencyFiatAmount = useHigherUSDValue(inputCurrencyAmount || undefined)
  const outputCurrencyFiatAmount = useHigherUSDValue(outputCurrencyAmount || undefined)

  return useSafeMemoObject({
    orderKind,
    deadlineTimestamp,
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
