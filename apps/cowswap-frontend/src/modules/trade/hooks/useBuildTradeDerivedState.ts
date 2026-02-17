import { Atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { tryParseFractionalAmount } from '@cowprotocol/common-utils'
import { BuyTokensParams } from '@cowprotocol/sdk-bridging'
import { useTokenBySymbolOrAddress } from '@cowprotocol/tokens'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useBridgeSupportedTokens } from 'entities/bridgeProvider'
import { Nullish } from 'types'

import { useCurrencyAmountBalanceCombined } from 'modules/combinedBalances'
import { ExtendedTradeRawState } from 'modules/trade'
import { useTradeUsdAmounts } from 'modules/usdAmount'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { TradeDerivedState } from '../types'

export function useBuildTradeDerivedState(
  stateAtom: Atom<ExtendedTradeRawState>,
  isQuoteBasedOrder: boolean,
): Omit<TradeDerivedState, 'slippage' | 'tradeType'> {
  const rawState = useAtomValue(stateAtom)
  const { inputCurrencyId, outputCurrencyId } = rawState

  const targetChainId = rawState.targetChainId || undefined
  const recipient = rawState.recipient
  const recipientAddress = rawState.recipientAddress
  const orderKind = rawState.orderKind
  const sellChainId = rawState.chainId

  const inputCurrency = useTokenBySymbolOrAddress(inputCurrencyId, sellChainId)

  const buyTokensParams: BuyTokensParams | undefined = useMemo(() => {
    if (!targetChainId) return undefined

    return {
      buyChainId: targetChainId,
      sellChainId: sellChainId || undefined,
    }
  }, [sellChainId, targetChainId])

  const outputCurrencyFromBridge = useTokenForTargetChain(buyTokensParams, outputCurrencyId)
  const outputCurrencyFromTokenLists = useTokenBySymbolOrAddress(targetChainId ? null : outputCurrencyId, sellChainId)

  const outputCurrency = outputCurrencyFromBridge || outputCurrencyFromTokenLists

  const inputCurrencyAmount = useMemo(
    () => getCurrencyAmount(inputCurrency, rawState.inputCurrencyAmount),
    [inputCurrency, rawState.inputCurrencyAmount],
  )
  const outputCurrencyAmount = useMemo(
    () => getCurrencyAmount(outputCurrency, rawState.outputCurrencyAmount),
    [outputCurrency, rawState.outputCurrencyAmount],
  )
  const inputCurrencyBalance = useCurrencyAmountBalanceCombined(inputCurrency) || null
  const outputCurrencyBalance = useCurrencyAmountBalanceCombined(outputCurrency) || null

  const {
    inputAmount: { value: inputCurrencyFiatAmount },
    outputAmount: { value: outputCurrencyFiatAmount },
  } = useTradeUsdAmounts(inputCurrencyAmount, outputCurrencyAmount, inputCurrency, outputCurrency, true)

  return useSafeMemoObject({
    orderKind,
    recipient,
    recipientAddress,
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    inputCurrencyBalance,
    outputCurrencyBalance,
    inputCurrencyFiatAmount,
    outputCurrencyFiatAmount,
    isQuoteBasedOrder,
  })
}

function useTokenForTargetChain(params: BuyTokensParams | undefined, currencyId: string | null): TokenWithLogo | null {
  const result = useBridgeSupportedTokens(params)

  return useMemo(() => {
    if (!result.data?.tokens?.length || !currencyId) return null

    const currencyIdLower = currencyId.toLowerCase()

    return result.data.tokens.find((token) => token.address.toLowerCase() === currencyIdLower) || null
  }, [result, currencyId])
}

function getCurrencyAmount(
  currency: Nullish<Currency> | null,
  currencyAmount: Nullish<string>,
): CurrencyAmount<Currency> | null {
  if (!currency || !currencyAmount) {
    return null
  }
  // State can be stored as a full string in atoms rather than a json with numerator/denominator
  // Thus we try just that in case the first option fails
  return tryParseFractionalAmount(currency, currencyAmount) || CurrencyAmount.fromRawAmount(currency, currencyAmount)
}
