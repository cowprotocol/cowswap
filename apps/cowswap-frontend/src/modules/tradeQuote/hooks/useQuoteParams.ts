import { ZERO_ADDRESS } from '@cowprotocol/common-const'
import { useDebounce } from '@cowprotocol/common-hooks'
import { getCurrencyAddress, isAddress } from '@cowprotocol/common-utils'
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

  const { inputCurrency, outputCurrency, orderKind, recipientAddress } = state || {}

  const receiver = recipientAddress && isAddress(recipientAddress) ? recipientAddress : account

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
      owner: (account || ZERO_ADDRESS) as `0x${string}`,
      amount,
      receiver,
      validFor: DEFAULT_QUOTE_TTL,
      ...(volumeFee ? { partnerFee: volumeFee } : null),
    }

    return { quoteParams, inputCurrency, appData: appData?.doc }
  }, [
    inputCurrency,
    outputCurrency,
    amount,
    orderKind,
    appData?.doc,
    receiver,
    account,
    isWrapOrUnwrap,
    isProviderNetworkUnsupported,
  ])

  return useDebounce(params, AMOUNT_CHANGE_DEBOUNCE_TIME)
}
