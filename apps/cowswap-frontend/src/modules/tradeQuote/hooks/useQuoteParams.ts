import { useEffect, useRef } from 'react'

import { DEFAULT_APP_CODE } from '@cowprotocol/common-const'
import { useDebounce } from '@cowprotocol/common-hooks'
import { COW_PROTOCOL_ETH_FLOW_ADDRESS, getCurrencyAddress } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import ms from 'ms.macro'
import { Nullish } from 'types'

import { AppDataInfo, useAppData } from 'modules/appData'
import { useDerivedTradeState, useIsWrapOrUnwrap } from 'modules/trade'
import { useTradeSlippageValueAndType } from 'modules/tradeSlippage'
import { useVolumeFee } from 'modules/volumeFee'
import { VolumeFee } from 'modules/volumeFee/types'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
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

interface BuildQuoteParamsArgs {
  inputCurrency: Currency
  outputCurrency: Currency
  orderKind: OrderKind
  amount: string
  account: string | undefined
  provider: ReturnType<typeof useWalletProvider>
  appDataDoc: AppDataInfo['doc'] | undefined
  receiver: string | undefined
  bridgeRecipient: string | undefined
  volumeFee: VolumeFee | undefined
  userSlippageBps: number | undefined
  partiallyFillable: boolean
  hasSmartSlippage: boolean
}

function buildQuoteParams(args: BuildQuoteParamsArgs): QuoteParams {
  const { inputCurrency, outputCurrency, orderKind, amount, account, provider } = args
  const { appDataDoc, receiver, bridgeRecipient, volumeFee, userSlippageBps, partiallyFillable, hasSmartSlippage } =
    args

  // BridgingSDK needs a wallet for route validation, use a hardcoded one when not connected
  const signer = account ? provider!.getSigner() : getBridgeQuoteSigner(inputCurrency.chainId)
  const owner = (account || BRIDGE_QUOTE_ACCOUNT) as `0x${string}`

  const quoteParams: QuoteBridgeRequest = {
    kind: orderKind,
    amount: BigInt(amount),
    owner,
    sellTokenChainId: inputCurrency.chainId,
    sellTokenAddress: getCurrencyAddress(inputCurrency),
    sellTokenDecimals: inputCurrency.decimals,
    buyTokenChainId: outputCurrency.chainId,
    buyTokenAddress: getCurrencyAddress(outputCurrency),
    buyTokenDecimals: outputCurrency.decimals,
    account: owner,
    appCode: appDataDoc?.appCode || DEFAULT_APP_CODE,
    signer,
    ethFlowContractOverride: COW_PROTOCOL_ETH_FLOW_ADDRESS,
    receiver,
    ...(bridgeRecipient ? { bridgeRecipient } : undefined),
    validFor: DEFAULT_QUOTE_TTL,
    ...(volumeFee ? { partnerFee: volumeFee } : undefined),
    partiallyFillable,
    ...(typeof userSlippageBps === 'number' ? { swapSlippageBps: userSlippageBps } : undefined),
  }

  return { quoteParams, inputCurrency, appData: appDataDoc, hasSmartSlippage }
}

export function useQuoteParams(amount: Nullish<string>, partiallyFillable = false): QuoteParams | undefined {
  const { account } = useWalletInfo()
  const provider = useWalletProvider()
  const appData = useAppData()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isProviderNetworkDeprecated = useIsProviderNetworkDeprecated()

  const state = useDerivedTradeState()
  const volumeFee = useVolumeFee()
  const tradeSlippage = useTradeSlippageValueAndType()

  const userSlippageBps = tradeSlippage.type === 'user' ? tradeSlippage.value : undefined
  const smartSlippageBps = tradeSlippage.type === 'smart' ? tradeSlippage.value : undefined

  const smartSlippageBpsRef = useRef(smartSlippageBps)
  useEffect(() => {
    smartSlippageBpsRef.current = smartSlippageBps
  }, [smartSlippageBps])

  const { inputCurrency, outputCurrency, orderKind } = state || {}
  const { receiver, bridgeRecipient } = useQuoteParamsRecipient()
  const appDataDoc = appData?.doc

  const params = useSafeMemo(() => {
    if (isWrapOrUnwrap || isProviderNetworkUnsupported || isProviderNetworkDeprecated) return
    if (!inputCurrency || !outputCurrency || !orderKind || !provider) return

    if (!amount) {
      return { quoteParams: undefined, inputCurrency, appData: appDataDoc }
    }

    return buildQuoteParams({
      inputCurrency,
      outputCurrency,
      orderKind,
      amount,
      account,
      provider,
      appDataDoc,
      receiver,
      bridgeRecipient,
      volumeFee,
      userSlippageBps,
      partiallyFillable,
      hasSmartSlippage: typeof smartSlippageBpsRef.current === 'number',
    })
  }, [
    provider,
    inputCurrency,
    outputCurrency,
    amount,
    partiallyFillable,
    orderKind,
    appDataDoc,
    receiver,
    bridgeRecipient,
    account,
    isWrapOrUnwrap,
    isProviderNetworkUnsupported,
    isProviderNetworkDeprecated,
    userSlippageBps,
  ])

  return useDebounce(params, AMOUNT_CHANGE_DEBOUNCE_TIME)
}
