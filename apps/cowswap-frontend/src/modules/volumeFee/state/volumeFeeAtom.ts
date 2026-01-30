import { atom } from 'jotai'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { walletInfoAtom } from '@cowprotocol/wallet'
import { resolveFlexibleConfig } from '@cowprotocol/widget-lib'

import { correlatedTokensAtom } from 'entities/correlatedTokens'

import { injectedWidgetPartnerFeeAtom } from 'modules/injectedWidget'
import { derivedTradeStateAtom, tradeTypeAtom, TradeTypeToWidgetTradeTypeMap } from 'modules/trade'
import { tradeQuotesAtom } from 'modules/tradeQuote'

import { getBridgeIntermediateTokenAddress } from 'common/utils/getBridgeIntermediateTokenAddress'

import { isCorrelatedTrade } from './isCorrelatedTrade'
import { safeAppFeeAtom } from './safeAppFeeAtom'

import { VolumeFee } from '../types'

export const volumeFeeAtom = atom<VolumeFee | undefined>((get) => {
  const widgetPartnerFee = get(widgetPartnerFeeAtom)
  const safeAppFee = get(safeAppFeeAtom)
  const shouldSkipFee = get(shouldSkipFeeAtom)

  if (!widgetPartnerFee && shouldSkipFee) {
    return undefined
  }

  // CoW Swap Fee won't be enabled when in Widget mode, thus it takes precedence here
  return safeAppFee || widgetPartnerFee
})

const shouldSkipFeeAtom = atom<boolean>((get) => {
  const { chainId } = get(walletInfoAtom)
  const { inputCurrency, outputCurrency } = get(derivedTradeStateAtom) || {}
  const correlatedTokens = get(correlatedTokensAtom)[chainId]

  if (!inputCurrency || !outputCurrency || !correlatedTokens) return false

  const inputCurrencyAddress = getCurrencyAddress(inputCurrency).toLowerCase()

  let outputCurrencyAddress = getCurrencyAddress(outputCurrency).toLowerCase()

  if (inputCurrency.chainId !== outputCurrency.chainId) {
    const tradeQuotes = get(tradeQuotesAtom)
    const bridgeQuote = tradeQuotes[inputCurrencyAddress]?.bridgeQuote ?? null

    outputCurrencyAddress = getBridgeIntermediateTokenAddress(bridgeQuote)?.toLowerCase() ?? ''
  }

  return isCorrelatedTrade(inputCurrencyAddress, outputCurrencyAddress, correlatedTokens)
})

const widgetPartnerFeeAtom = atom<VolumeFee | undefined>((get) => {
  const { chainId } = get(walletInfoAtom)
  const partnerFee = get(injectedWidgetPartnerFeeAtom)
  const tradeType = get(tradeTypeAtom)?.tradeType

  if (!tradeType || !partnerFee) {
    return undefined
  }

  const bps = resolveFlexibleConfig(partnerFee.bps, chainId, TradeTypeToWidgetTradeTypeMap[tradeType])
  const recipient = resolveFlexibleConfig(partnerFee.recipient, chainId, TradeTypeToWidgetTradeTypeMap[tradeType])

  if (!bps || !recipient) return undefined

  return {
    volumeBps: bps,
    recipient,
  }
})
