import { getCurrencyAddress, getWrappedToken } from '@cowprotocol/common-utils'
import { PriceQuality } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'

import { useAppData } from 'modules/appData'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

import { useSafeMemo } from 'common/hooks/useSafeMemo'
import { FeeQuoteParams } from 'common/types'

const DEFAULT_QUOTE_TTL = ms`30m` / 1000

export function useQuoteParams(amount: string | null): FeeQuoteParams | undefined {
  const { chainId, account } = useWalletInfo()
  const appData = useAppData()

  const state = useDerivedTradeState()

  const { inputCurrency, outputCurrency, orderKind } = state || {}

  return useSafeMemo(() => {
    const sellToken = inputCurrency ? getWrappedToken(inputCurrency).address : undefined
    const buyToken = outputCurrency ? getCurrencyAddress(outputCurrency) : undefined
    const fromDecimals = inputCurrency?.decimals
    const toDecimals = outputCurrency?.decimals

    if (!sellToken || !buyToken || !amount || !orderKind) return

    const params: FeeQuoteParams = {
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
      priceQuality: PriceQuality.OPTIMAL,
      appData: appData?.fullAppData,
      appDataHash: appData?.appDataKeccak256,
      validFor: DEFAULT_QUOTE_TTL,
    }

    return params
  }, [
    inputCurrency,
    outputCurrency,
    amount,
    orderKind,
    chainId,
    account,
    appData?.fullAppData,
    appData?.appDataKeccak256,
  ])
}
