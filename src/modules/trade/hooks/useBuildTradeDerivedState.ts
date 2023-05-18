import { Atom } from 'jotai/core/atom'
import { ExtendedTradeRawState } from 'modules/trade/types/TradeRawState'
import { useWalletInfo } from 'modules/wallet'
import { useAtomValue } from 'jotai/utils'
import { useTokenBySymbolOrAddress } from 'common/hooks/useTokenBySymbolOrAddress'
import { tryParseFractionalAmount } from 'utils/tryParseFractionalAmount'
import useCurrencyBalance from 'modules/tokens/hooks/useCurrencyBalance'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

export function useBuildTradeDerivedState(stateAtom: Atom<ExtendedTradeRawState>) {
  const { account } = useWalletInfo()
  const rawState = useAtomValue(stateAtom)

  const recipient = rawState.recipient
  const orderKind = rawState.orderKind

  const inputCurrency = useTokenBySymbolOrAddress(rawState.inputCurrencyId)
  const outputCurrency = useTokenBySymbolOrAddress(rawState.outputCurrencyId)
  const inputCurrencyAmount = tryParseFractionalAmount(inputCurrency, rawState.inputCurrencyAmount)
  const outputCurrencyAmount = tryParseFractionalAmount(outputCurrency, rawState.outputCurrencyAmount)
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
