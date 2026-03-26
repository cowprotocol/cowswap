import { useEffect, useRef } from 'react'

import { DEFAULT_APP_CODE } from '@cowprotocol/common-const'
import { useDebounce } from '@cowprotocol/common-hooks'
import { COW_PROTOCOL_ETH_FLOW_ADDRESS, getCurrencyAddress } from '@cowprotocol/common-utils'
import { Currency } from '@cowprotocol/currency'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import ms from 'ms.macro'
import { Nullish } from 'types'

import { AppDataInfo, useAppData } from 'modules/appData'
import { useIsWrapOrUnwrap, useDerivedTradeState } from 'modules/trade'
import { useTradeSlippageValueAndType } from 'modules/tradeSlippage'
import { useVolumeFee } from 'modules/volumeFee'
import type { VolumeFee } from 'modules/volumeFee'

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

function buildQuoteParams(args: {
  amount: Nullish<string>
  partiallyFillable: boolean
  inputCurrency: Currency
  outputCurrency: Currency
  orderKind: QuoteBridgeRequest['kind']
  appDataDoc: AppDataInfo['doc'] | undefined
  receiver: QuoteBridgeRequest['receiver']
  account: string | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any
  volumeFee: VolumeFee | undefined
  userSlippageBps: number | undefined
  smartSlippageBpsRef: { current: number | undefined }
}): QuoteParams | undefined {
  const {
    amount,
    partiallyFillable,
    inputCurrency,
    outputCurrency,
    orderKind,
    appDataDoc,
    receiver,
    account,
    provider,
    volumeFee,
    userSlippageBps,
    smartSlippageBpsRef,
  } = args
  const appCode = appDataDoc?.appCode || DEFAULT_APP_CODE
  const sellTokenAddress = getCurrencyAddress(inputCurrency)
  const buyTokenAddress = getCurrencyAddress(outputCurrency)
  if (!amount) {
    return { quoteParams: undefined, inputCurrency, appData: appDataDoc }
  }
  // Check if provider has getSigner method (wallet provider vs publicClient fallback)
  const hasGetSigner = typeof provider.getSigner === 'function'
  const signer = account && hasGetSigner ? provider.getSigner() : getBridgeQuoteSigner(inputCurrency.chainId)
  const owner = (account || BRIDGE_QUOTE_ACCOUNT) as `0x${string}`
  const quoteParams: QuoteBridgeRequest = {
    kind: orderKind,
    amount: BigInt(amount),
    owner,
    sellTokenChainId: inputCurrency.chainId,
    sellTokenAddress,
    sellTokenDecimals: inputCurrency.decimals,
    buyTokenChainId: outputCurrency.chainId,
    buyTokenAddress,
    buyTokenDecimals: outputCurrency.decimals,
    account: owner,
    appCode,
    signer,
    receiver,
    validFor: DEFAULT_QUOTE_TTL,
    ethFlowContractOverride: COW_PROTOCOL_ETH_FLOW_ADDRESS,
    ...(volumeFee ? { partnerFee: volumeFee } : undefined),
    partiallyFillable,
    ...(typeof userSlippageBps === 'number' ? { swapSlippageBps: userSlippageBps } : undefined),
  }
  return {
    quoteParams,
    inputCurrency,
    appData: appDataDoc,
    hasSmartSlippage: typeof smartSlippageBpsRef.current === 'number',
  }
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
  const receiver = useQuoteParamsRecipient()
  const appDataDoc = appData?.doc

  const params = useSafeMemo(() => {
    if (isWrapOrUnwrap || isProviderNetworkUnsupported || isProviderNetworkDeprecated) return
    if (!inputCurrency || !outputCurrency || !orderKind || !provider) return
    return buildQuoteParams({
      amount,
      partiallyFillable,
      inputCurrency,
      outputCurrency,
      orderKind,
      appDataDoc,
      receiver,
      account,
      provider,
      volumeFee,
      userSlippageBps,
      smartSlippageBpsRef,
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
    account,
    isWrapOrUnwrap,
    isProviderNetworkUnsupported,
    isProviderNetworkDeprecated,
    userSlippageBps,
    smartSlippageBps,
  ])

  return useDebounce(params, AMOUNT_CHANGE_DEBOUNCE_TIME)
}
