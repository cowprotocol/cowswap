import { useMemo } from 'react'

import { CurrencyAmount } from '@uniswap/sdk-core'

import { NATIVE_CURRENCY_BUY_ADDRESS } from 'legacy/constants'

import { useEnoughBalanceAndAllowance } from 'modules/tokens'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useWalletInfo } from 'modules/wallet'

import { getPriceQuality } from 'api/gnosisProtocol/api'
import { useVerifiedQuotesEnabled } from 'common/hooks/featureFlags/useVerifiedQuotesEnabled'
import { getAddress } from 'utils/getAddress'

export function useQuoteParams(amount: string | null) {
  const { chainId, account } = useWalletInfo()
  const verifiedQuotesEnabled = useVerifiedQuotesEnabled(chainId)

  const { state } = useDerivedTradeState()

  const { inputCurrency, outputCurrency, orderKind } = state || {}

  const sellToken = getAddress(inputCurrency)
  const buyToken = outputCurrency?.isNative ? NATIVE_CURRENCY_BUY_ADDRESS : getAddress(outputCurrency)
  const fromDecimals = inputCurrency?.decimals
  const toDecimals = outputCurrency?.decimals

  const enoughBalance = useEnoughBalanceAndAllowance({
    account,
    amount: (inputCurrency && amount && CurrencyAmount.fromRawAmount(inputCurrency, amount)) || undefined,
  })

  return useMemo(() => {
    if (!sellToken || !buyToken || !amount) return

    return {
      sellToken,
      buyToken,
      amount,
      chainId,
      // The field is used in _mapNewToLegacyParams()
      userAddress: account,
      receiver: account,
      kind: orderKind,
      toDecimals,
      fromDecimals,
      isEthFlow: false,
      priceQuality: getPriceQuality({ verifyQuote: enoughBalance && verifiedQuotesEnabled }),
    }
  }, [
    amount,
    account,
    chainId,
    orderKind,
    enoughBalance,
    buyToken,
    fromDecimals,
    sellToken,
    toDecimals,
    verifiedQuotesEnabled,
  ])
}
