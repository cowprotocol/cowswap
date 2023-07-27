import { useMemo } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { NATIVE_CURRENCY_BUY_ADDRESS } from 'legacy/constants'

import { useEnoughBalance } from 'modules/tokens'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useWalletInfo } from 'modules/wallet'

import { getPriceQuality } from 'api/gnosisProtocol/api'
import { getAddress } from 'utils/getAddress'

export function useQuoteParams(amount: string | null) {
  const { chainId, account } = useWalletInfo()
  const { state } = useDerivedTradeState()

  const { inputCurrency, outputCurrency, orderKind } = state || {}

  const sellToken = getAddress(inputCurrency)
  const buyToken = outputCurrency?.isNative ? NATIVE_CURRENCY_BUY_ADDRESS : getAddress(outputCurrency)
  const fromDecimals = inputCurrency?.decimals
  const toDecimals = outputCurrency?.decimals

  const currency = orderKind === OrderKind.SELL ? inputCurrency : outputCurrency
  const enoughBalance = useEnoughBalance({
    account,
    amount: (currency && amount && CurrencyAmount.fromRawAmount(currency, amount)) || undefined,
  })

  return useMemo(() => {
    if (!sellToken || !buyToken || !amount) return

    return {
      sellToken,
      buyToken,
      amount,
      chainId,
      receiver: account,
      kind: orderKind,
      toDecimals,
      fromDecimals,
      isEthFlow: false,
      priceQuality: getPriceQuality({ verifyQuote: enoughBalance }),
    }
  }, [amount, account, chainId, orderKind, enoughBalance, buyToken, fromDecimals, sellToken, toDecimals])
}
