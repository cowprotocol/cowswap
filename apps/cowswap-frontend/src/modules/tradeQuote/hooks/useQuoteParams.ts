import { useMemo } from 'react'

import { NATIVE_CURRENCY_BUY_ADDRESS } from '@cowprotocol/common-const'
import { getAddress } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { LegacyFeeQuoteParams } from 'legacy/state/price/types'

import { useEnoughBalanceAndAllowance } from 'modules/tokens'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

import { getPriceQuality } from 'api/gnosisProtocol/api'
import { useVerifiedQuotesEnabled } from 'common/hooks/featureFlags/useVerifiedQuotesEnabled'

export function useQuoteParams(amount: string | null): LegacyFeeQuoteParams | undefined {
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
    if (!sellToken || !buyToken || !amount || !orderKind) return

    const params: LegacyFeeQuoteParams = {
      sellToken,
      buyToken,
      amount,
      chainId,
      userAddress: account,
      receiver: account,
      kind: orderKind,
      toDecimals,
      fromDecimals,
      isEthFlow: false,
      priceQuality: getPriceQuality({ verifyQuote: verifiedQuotesEnabled && enoughBalance }),
    }

    return params
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
