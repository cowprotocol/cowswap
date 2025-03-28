import { DEFAULT_APP_CODE, ZERO_ADDRESS } from '@cowprotocol/common-const'
import { useDebounce } from '@cowprotocol/common-hooks'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { QuoteBridgeRequest } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
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
  quoteParams: QuoteBridgeRequest
  inputCurrency: Currency
  appData: AppDataInfo['doc'] | undefined
}

export function useQuoteParams(amount: Nullish<string>): QuoteParams | undefined {
  const { account } = useWalletInfo()
  const provider = useWalletProvider()
  const appData = useAppData()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()

  const state = useDerivedTradeState()
  const volumeFee = useVolumeFee()

  const { inputCurrency, outputCurrency, orderKind } = state || {}

  const params = useSafeMemo(() => {
    if (isWrapOrUnwrap || isProviderNetworkUnsupported) return
    if (!inputCurrency || !outputCurrency || !amount || !orderKind || !provider) return

    const appCode = appData?.doc.appCode || DEFAULT_APP_CODE

    const sellTokenAddress = getCurrencyAddress(inputCurrency)
    const buyTokenAddress = getCurrencyAddress(outputCurrency)

    const sellTokenDecimals = inputCurrency.decimals
    const buyTokenDecimals = outputCurrency.decimals

    const quoteParams: QuoteBridgeRequest = {
      kind: orderKind as any, // TODO: fix
      amount: BigInt(amount),
      owner: (account || ZERO_ADDRESS) as `0x${string}`,

      sellTokenChainId: inputCurrency.chainId,
      sellTokenAddress,
      sellTokenDecimals,

      buyTokenChainId: outputCurrency.chainId,
      buyTokenAddress,
      buyTokenDecimals,

      account: account as `0x${string}`,
      appCode,
      signer: provider.provider,

      receiver: account,
      validFor: DEFAULT_QUOTE_TTL,
      ...(volumeFee ? { partnerFee: volumeFee } : null),
    }

    return { quoteParams, inputCurrency, appData: appData?.doc }
  }, [
    provider,
    inputCurrency,
    outputCurrency,
    amount,
    orderKind,
    appData?.doc,
    isWrapOrUnwrap,
    isProviderNetworkUnsupported,
  ])

  return useDebounce(params, AMOUNT_CHANGE_DEBOUNCE_TIME)
}
