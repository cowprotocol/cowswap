import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useRef } from 'react'

import { DEFAULT_APP_CODE } from '@cowprotocol/common-const'
import { useDebounce, useFeatureFlags } from '@cowprotocol/common-hooks'
import { COW_PROTOCOL_ETH_FLOW_ADDRESS, getCurrencyAddress } from '@cowprotocol/common-utils'
import { getGlobalAdapter, isSolanaChain, OrderKind } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'
import { isEoaAtom, useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'
import { Nullish } from 'types'

import { AppDataInfo, useAppData } from 'modules/appData'
import { useDerivedTradeState, useIsWrapOrUnwrap } from 'modules/trade'
import { useTradeSlippageValueAndType } from 'modules/tradeSlippage'
import type { VolumeFee } from 'modules/volumeFee'
import { useVolumeFee } from 'modules/volumeFee'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useQuoteParamsRecipient } from './useQuoteParamsRecipient'

import { BRIDGE_QUOTE_ACCOUNT, getBridgeQuoteSigner, NON_EVM_CHAIN_CONFIG } from '../utils/getBridgeQuoteSigner'
import { getEoaTwapQuotePreHooks } from '../utils/getEoaTwapQuotePreHooks'
import { withAdditionalPreHooks } from '../utils/withAdditionalPreHooks'

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
  appDataDoc: AppDataInfo['doc'] | undefined
  receiver: Nullish<string>
  bridgeRecipient: Nullish<string>
  volumeFee: VolumeFee | undefined
  userSlippageBps: number | undefined
  partiallyFillable: boolean
  hasSmartSlippage: boolean
}

export function useQuoteParams(amount: Nullish<string>, partiallyFillable = false): QuoteParams | undefined {
  const { account, chainId } = useWalletInfo()
  const isEoa = useAtomValue(isEoaAtom)
  const { isTwapEoaEnabled } = useFeatureFlags()
  const appData = useAppData()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isProviderNetworkDeprecated = useIsProviderNetworkDeprecated()
  const state = useDerivedTradeState()
  const volumeFee = useVolumeFee()
  const tradeSlippage = useTradeSlippageValueAndType()
  const smartSlippageBps = tradeSlippage.type === 'smart' ? tradeSlippage.value : undefined

  const smartSlippageBpsRef = useRef(smartSlippageBps)
  useEffect(() => {
    smartSlippageBpsRef.current = smartSlippageBps
  }, [smartSlippageBps])

  const { inputCurrency, outputCurrency, orderKind } = state || {}

  // Solana signs exactly the tolerance it is handed, so the resolved one must travel with the quote,
  // not only an explicit user override. Keyed on the sell token's chain — what the quote routes on.
  const isSolana = !!inputCurrency && isSolanaChain(inputCurrency.chainId)
  const userSlippageBps = tradeSlippage.type === 'user' || isSolana ? tradeSlippage.value : undefined
  const { receiver, bridgeRecipient } = useQuoteParamsRecipient()

  const appDataDoc = useMemo(() => {
    const additionalPreHooks = getEoaTwapQuotePreHooks({
      orderClass: appData?.doc?.metadata?.orderClass?.orderClass,
      isTwapEoaEnabled: !!isTwapEoaEnabled,
      isEoa,
      chainId,
    })

    return withAdditionalPreHooks(appData?.doc, additionalPreHooks)
  }, [appData?.doc, isTwapEoaEnabled, isEoa, chainId])

  const params = useSafeMemo(() => {
    if (isWrapOrUnwrap || isProviderNetworkUnsupported || isProviderNetworkDeprecated) return
    if (!inputCurrency || !outputCurrency || !orderKind) return

    if (!amount) {
      return { quoteParams: undefined, inputCurrency, appData: appDataDoc }
    }

    return buildQuoteParams({
      inputCurrency,
      outputCurrency,
      orderKind,
      amount,
      account,
      appDataDoc,
      receiver,
      bridgeRecipient,
      volumeFee,
      userSlippageBps,
      partiallyFillable,
      hasSmartSlippage: typeof smartSlippageBpsRef.current === 'number',
    })
  }, [
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

function buildQuoteParams(args: BuildQuoteParamsArgs): QuoteParams {
  const { inputCurrency, outputCurrency, orderKind, amount, account } = args
  const { appDataDoc, receiver, bridgeRecipient, volumeFee, userSlippageBps, partiallyFillable, hasSmartSlippage } =
    args

  const adapterSigner = account ? getGlobalAdapter().signerOrNull() : null
  const signer = adapterSigner || getBridgeQuoteSigner(inputCurrency.chainId)
  const owner = (account || getDefaultOwnerPlaceholder(inputCurrency.chainId)) as `0x${string}`

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

/** Returns the default owner/account placeholder for quoting when no wallet is connected.
 *  Falls back to the chain-specific non-EVM placeholder (e.g. Solana) so the sell chain's
 *  address format is respected instead of always using the EVM placeholder. */
function getDefaultOwnerPlaceholder(sellTokenChainId: number): string {
  return NON_EVM_CHAIN_CONFIG.find(({ isChain }) => isChain(sellTokenChainId))?.defaultRecipient ?? BRIDGE_QUOTE_ACCOUNT
}
