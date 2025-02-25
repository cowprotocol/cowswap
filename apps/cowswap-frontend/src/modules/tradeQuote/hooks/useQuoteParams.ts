import { getCurrencyAddress, getIsNativeToken, getWrappedToken } from '@cowprotocol/common-utils'
import { OrderKind, PriceQuality } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'

import { useAppData } from 'modules/appData'
import { useIsWrapOrUnwrap } from 'modules/trade'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

import { useSafeMemo } from 'common/hooks/useSafeMemo'
import { FeeQuoteParams } from 'common/types'

const DEFAULT_QUOTE_TTL = ms`30m` / 1000

export function useQuoteParams(amount: string | null, orderKind: OrderKind): FeeQuoteParams | undefined {
  const { chainId, account } = useWalletInfo()
  const appData = useAppData()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  const state = useDerivedTradeState()

  const { inputCurrency, outputCurrency } = state || {}

  return useSafeMemo(() => {
    if (isWrapOrUnwrap) return
    if (!inputCurrency || !outputCurrency || !amount || !orderKind) return

    const sellToken = getWrappedToken(inputCurrency).address
    const buyToken = getCurrencyAddress(outputCurrency)
    const fromDecimals = inputCurrency.decimals
    const toDecimals = outputCurrency.decimals

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
      isEthFlow: getIsNativeToken(inputCurrency),
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
    isWrapOrUnwrap,
  ])
}
