import { useDebounce } from '@cowprotocol/common-hooks'
import { getCurrencyAddress, getIsNativeToken, getWrappedToken } from '@cowprotocol/common-utils'
import { PriceQuality } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'
import { Nullish } from 'types'

import { useAppData } from 'modules/appData'
import { useIsWrapOrUnwrap } from 'modules/trade'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { useSafeMemo } from 'common/hooks/useSafeMemo'
import { FeeQuoteParams } from 'common/types'

const DEFAULT_QUOTE_TTL = ms`30m` / 1000
const AMOUNT_CHANGE_DEBOUNCE_TIME = ms`350ms`

export function useQuoteParams(amount: Nullish<string>): FeeQuoteParams | undefined {
  const { chainId, account } = useWalletInfo()
  const appData = useAppData()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()

  const state = useDerivedTradeState()

  const { inputCurrency, outputCurrency, orderKind } = state || {}

  const params = useSafeMemo(() => {
    if (isWrapOrUnwrap || isProviderNetworkUnsupported) return
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
    isProviderNetworkUnsupported,
  ])

  return useDebounce(params, AMOUNT_CHANGE_DEBOUNCE_TIME)
}
