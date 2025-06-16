import { DEFAULT_APP_CODE, ZERO_ADDRESS } from '@cowprotocol/common-const'
import { useDebounce } from '@cowprotocol/common-hooks'
import { getCurrencyAddress, isAddress } from '@cowprotocol/common-utils'
import { QuoteBridgeRequest } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { Currency } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import { Nullish } from 'types'

import { AppDataInfo, useAppData } from 'modules/appData'
import { useIsWrapOrUnwrap } from 'modules/trade'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useTradeSlippageValueAndType } from 'modules/tradeSlippage'
import { useVolumeFee } from 'modules/volumeFee'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { useSafeMemo } from 'common/hooks/useSafeMemo'

const DEFAULT_QUOTE_TTL = ms`30m` / 1000
const AMOUNT_CHANGE_DEBOUNCE_TIME = ms`350ms`

export interface QuoteParams {
  quoteParams: QuoteBridgeRequest | undefined
  inputCurrency: Currency
  appData: AppDataInfo['doc'] | undefined
}

export function useQuoteParams(amount: Nullish<string>, partiallyFillable = false): QuoteParams | undefined {
  const { account } = useWalletInfo()
  const provider = useWalletProvider()
  const appData = useAppData()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()

  const state = useDerivedTradeState()
  const volumeFee = useVolumeFee()
  const tradeSlippage = useTradeSlippageValueAndType()
  const slippageBps = tradeSlippage.type === 'user' ? tradeSlippage.value : undefined

  const { inputCurrency, outputCurrency, orderKind, recipientAddress } = state || {}

  const receiver = recipientAddress && isAddress(recipientAddress) ? recipientAddress : account

  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line complexity
  const params = useSafeMemo(() => {
    if (isWrapOrUnwrap || isProviderNetworkUnsupported) return
    if (!inputCurrency || !outputCurrency || !orderKind || !provider) return

    const appCode = appData?.doc.appCode || DEFAULT_APP_CODE

    const sellTokenAddress = getCurrencyAddress(inputCurrency)
    const buyTokenAddress = getCurrencyAddress(outputCurrency)

    const sellTokenDecimals = inputCurrency.decimals
    const buyTokenDecimals = outputCurrency.decimals

    if (!amount) {
      return {
        quoteParams: undefined,
        inputCurrency,
        appData: appData?.doc,
      }
    }

    const owner = (account || ZERO_ADDRESS) as `0x${string}`
    const quoteParams: QuoteBridgeRequest = {
      kind: orderKind,
      amount: BigInt(amount),
      owner,

      sellTokenChainId: inputCurrency.chainId,
      sellTokenAddress,
      sellTokenDecimals,

      buyTokenChainId: outputCurrency.chainId,
      buyTokenAddress,
      buyTokenDecimals,

      account: owner,
      appCode,
      signer: provider.provider || provider.getSigner(),

      receiver,
      validFor: DEFAULT_QUOTE_TTL,
      ...(volumeFee ? { partnerFee: volumeFee } : undefined),
      partiallyFillable,
      slippageBps,
    }

    return { quoteParams, inputCurrency, appData: appData?.doc }
  }, [
    provider,
    inputCurrency,
    outputCurrency,
    amount,
    partiallyFillable,
    orderKind,
    appData?.doc,
    receiver,
    account,
    isWrapOrUnwrap,
    isProviderNetworkUnsupported,
    slippageBps,
  ])

  return useDebounce(params, AMOUNT_CHANGE_DEBOUNCE_TIME)
}
