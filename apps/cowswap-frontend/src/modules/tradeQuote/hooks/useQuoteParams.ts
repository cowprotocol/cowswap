import { useMemo } from 'react'

import { NATIVE_CURRENCY_ADDRESS } from '@cowprotocol/common-const'
import { getAddress, getIsNativeToken } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import ms from 'ms.macro'

import { LegacyFeeQuoteParams } from 'legacy/state/price/types'

import { useAppData } from 'modules/appData'
import { useEnoughBalanceAndAllowance } from 'modules/tokens'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

import { getPriceQuality } from 'api/gnosisProtocol/api'
import { useVerifiedQuotesEnabled } from 'common/hooks/featureFlags/useVerifiedQuotesEnabled'

const DEFAULT_QUOTE_TTL = ms`30m` / 1000

export function useQuoteParams(amount: string | null): LegacyFeeQuoteParams | undefined {
  const { chainId, account } = useWalletInfo()
  const verifiedQuotesEnabled = useVerifiedQuotesEnabled(chainId)
  const appData = useAppData()

  const { state } = useDerivedTradeState()

  const { inputCurrency, outputCurrency, orderKind } = state || {}

  const sellToken = getAddress(inputCurrency)
  const buyToken =
    outputCurrency && getIsNativeToken(outputCurrency) ? NATIVE_CURRENCY_ADDRESS : getAddress(outputCurrency)
  const fromDecimals = inputCurrency?.decimals
  const toDecimals = outputCurrency?.decimals

  const { enoughBalance } = useEnoughBalanceAndAllowance({
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
      appData: appData?.fullAppData,
      appDataHash: appData?.appDataKeccak256,
      validFor: DEFAULT_QUOTE_TTL,
    }

    return params
  }, [
    sellToken,
    buyToken,
    amount,
    orderKind,
    chainId,
    account,
    toDecimals,
    fromDecimals,
    enoughBalance,
    verifiedQuotesEnabled,
    appData?.fullAppData,
    appData?.appDataKeccak256,
  ])
}
