import { Atom, useAtomValue } from 'jotai'

import useCurrencyBalance from 'modules/tokens/hooks/useCurrencyBalance'
import { ExtendedTradeRawState } from 'modules/trade/types/TradeRawState'
import { useTradeUsdAmounts } from 'modules/usdAmount'
import { useWalletInfo } from 'modules/wallet'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'
import { useTokenBySymbolOrAddress } from 'common/hooks/useTokenBySymbolOrAddress'
import { tryParseFractionalAmount } from 'utils/tryParseFractionalAmount'

export function useBuildTradeDerivedState(stateAtom: Atom<ExtendedTradeRawState>) {
  const { account } = useWalletInfo()
  const rawState = useAtomValue(stateAtom)

  const recipient = rawState.recipient
  const recipientAddress = rawState.recipientAddress
  const orderKind = rawState.orderKind

  const inputCurrency = useTokenBySymbolOrAddress(rawState.inputCurrencyId)
  const outputCurrency = useTokenBySymbolOrAddress(rawState.outputCurrencyId)
  const inputCurrencyAmount = tryParseFractionalAmount(inputCurrency, rawState.inputCurrencyAmount)
  const outputCurrencyAmount = tryParseFractionalAmount(outputCurrency, rawState.outputCurrencyAmount)
  const inputCurrencyBalance = useCurrencyBalance(account, inputCurrency) || null
  const outputCurrencyBalance = useCurrencyBalance(account, outputCurrency) || null

  const {
    inputAmount: { value: inputCurrencyFiatAmount },
    outputAmount: { value: outputCurrencyFiatAmount },
  } = useTradeUsdAmounts(inputCurrencyAmount, outputCurrencyAmount)

  // In limit orders and advanced orders we don't have "real" buy orders
  const slippageAdjustedSellAmount = inputCurrencyAmount

  return useSafeMemoObject({
    orderKind,
    recipient,
    recipientAddress,
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    slippageAdjustedSellAmount,
    inputCurrencyBalance,
    outputCurrencyBalance,
    inputCurrencyFiatAmount,
    outputCurrencyFiatAmount,
  })
}
