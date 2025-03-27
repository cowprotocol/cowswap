import { useDebounce } from '@cowprotocol/common-hooks'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { TradeParameters } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import { Nullish } from 'types'

import { AppDataInfo, useAppData } from 'modules/appData'
import { useIsWrapOrUnwrap } from 'modules/trade'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useVolumeFee } from 'modules/volumeFee'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { useSafeMemo } from 'common/hooks/useSafeMemo'

const DEFAULT_QUOTE_TTL = ms`30m` / 1000
const AMOUNT_CHANGE_DEBOUNCE_TIME = ms`350ms`

export interface QuoteParams {
  quoteParams: TradeParameters
  inputCurrency: Currency
  appData: AppDataInfo['doc'] | undefined
}

export function useQuoteParams(amount: Nullish<string>): QuoteParams | undefined {
  const { account } = useWalletInfo()
  const appData = useAppData()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()

  const state = useDerivedTradeState()
  const volumeFee = useVolumeFee()

  const { inputCurrency, outputCurrency, orderKind } = state || {}

  const params = useSafeMemo(() => {
    if (isWrapOrUnwrap || isProviderNetworkUnsupported) return
    if (!inputCurrency || !outputCurrency || !amount || !orderKind) return

    const sellToken = getCurrencyAddress(inputCurrency)
    const buyToken = getCurrencyAddress(outputCurrency)

    const sellTokenDecimals = inputCurrency.decimals
    const buyTokenDecimals = outputCurrency.decimals

    const quoteParams: TradeParameters = {
      kind: orderKind,
      sellToken,
      buyToken,
      sellTokenDecimals,
      buyTokenDecimals,
      amount,
      receiver: account,
      validFor: DEFAULT_QUOTE_TTL,
      partnerFee: volumeFee,
    }

    return { quoteParams, inputCurrency, appData: appData?.doc }
  }, [inputCurrency, outputCurrency, amount, orderKind, appData?.doc, isWrapOrUnwrap, isProviderNetworkUnsupported])

  return useDebounce(params, AMOUNT_CHANGE_DEBOUNCE_TIME)
}
