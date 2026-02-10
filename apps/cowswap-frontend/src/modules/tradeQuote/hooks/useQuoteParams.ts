import { useEffect, useRef } from 'react'

import { DEFAULT_APP_CODE } from '@cowprotocol/common-const'
import { useDebounce } from '@cowprotocol/common-hooks'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'
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

import { useQuoteParamsRecipient } from './useQuoteParamsRecipient'

import { BRIDGE_QUOTE_ACCOUNT, getBridgeQuoteSigner } from '../utils/getBridgeQuoteSigner'

const DEFAULT_QUOTE_TTL = ms`30m` / 1000
const AMOUNT_CHANGE_DEBOUNCE_TIME = ms`350ms`

export interface QuoteParams {
  quoteParams: QuoteBridgeRequest | undefined
  inputCurrency: Currency
  appData: AppDataInfo['doc'] | undefined
  hasSmartSlippage?: boolean
}

export function useQuoteParams(amount: Nullish<string>, partiallyFillable = false): QuoteParams | undefined {
  const { account } = useWalletInfo()
  // TODO M-6 COW-573
  // This flow will be reviewed and updated later, to include a wagmi alternative
  const provider = useWalletProvider()
  const appData = useAppData()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()

  const state = useDerivedTradeState()
  const volumeFee = useVolumeFee()
  const tradeSlippage = useTradeSlippageValueAndType()

  const userSlippageBps = tradeSlippage.type === 'user' ? tradeSlippage.value : undefined
  const smartSlippageBps = tradeSlippage.type === 'smart' ? tradeSlippage.value : undefined

  /**
   * Smart-slippage change should not trigger quote fetching. Only user entered value should trigger it
   * Because of that, we use smartSlippageBps as ref
   */
  const smartSlippageBpsRef = useRef(smartSlippageBps)
  useEffect(() => {
    smartSlippageBpsRef.current = smartSlippageBps
  }, [smartSlippageBps])

  const { inputCurrency, outputCurrency, orderKind } = state || {}

  const receiver = useQuoteParamsRecipient()
  const appDataDoc = appData?.doc

  // eslint-disable-next-line complexity
  const params = useSafeMemo(() => {
    if (isWrapOrUnwrap || isProviderNetworkUnsupported) return
    if (!inputCurrency || !outputCurrency || !orderKind || !provider) return

    const appCode = appDataDoc?.appCode || DEFAULT_APP_CODE

    const sellTokenAddress = getCurrencyAddress(inputCurrency)
    const buyTokenAddress = getCurrencyAddress(outputCurrency)

    const sellTokenDecimals = inputCurrency.decimals
    const buyTokenDecimals = outputCurrency.decimals

    if (!amount) {
      return {
        quoteParams: undefined,
        inputCurrency,
        appData: appDataDoc,
      }
    }

    /**
     * BridgingSDK validates route, and they need a wallet for that, so we should provide a hardcoded wallet
     * Whe real one is not connected
     * See `SocketVerifier.callStatic.validateRotueId` in BridgingSDK
     */
    const signer = account ? provider.getSigner() : getBridgeQuoteSigner(inputCurrency.chainId)
    const owner = (account || BRIDGE_QUOTE_ACCOUNT) as `0x${string}`

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
      signer,

      receiver,
      validFor: DEFAULT_QUOTE_TTL,
      ...(volumeFee ? { partnerFee: volumeFee } : undefined),
      partiallyFillable,
      /**
       * Specify only the user entered slippage
       * Because if it's not specified, SDK will suggest a slippage, so no need to pass it in quote request
       */
      ...(userSlippageBps ? { swapSlippageBps: userSlippageBps } : undefined),
    }

    return {
      quoteParams,
      inputCurrency,
      appData: appDataDoc,
      hasSmartSlippage: typeof smartSlippageBpsRef.current === 'number',
    }
  }, [
    provider,
    inputCurrency,
    outputCurrency,
    amount,
    partiallyFillable,
    orderKind,
    appDataDoc,
    receiver,
    account,
    isWrapOrUnwrap,
    isProviderNetworkUnsupported,
    userSlippageBps,
  ])

  return useDebounce(params, AMOUNT_CHANGE_DEBOUNCE_TIME)
}
