import { atom } from 'jotai'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { walletInfoAtom } from '@cowprotocol/wallet'
import { resolveFlexibleConfig } from '@cowprotocol/widget-lib'

import { correlatedTokensAtom } from 'entities/correlatedTokens'

import { injectedWidgetPartnerFeeAtom } from 'modules/injectedWidget'
import { derivedTradeStateAtom, tradeTypeAtom, TradeTypeToWidgetTradeTypeMap } from 'modules/trade'

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
  const tradeState = get(derivedTradeStateAtom)
  const correlatedTokensState = get(correlatedTokensAtom)

  if (!tradeState) return false

  const correlatedTokens = correlatedTokensState[chainId]

  if (!correlatedTokens) return false

  const { inputCurrency, outputCurrency } = tradeState

  if (!inputCurrency || !outputCurrency) return false

  if (inputCurrency.chainId !== outputCurrency.chainId) return false

  const inputCurrencyAddress = getCurrencyAddress(inputCurrency).toLowerCase()
  const outputCurrencyAddress = getCurrencyAddress(outputCurrency).toLowerCase()

  return correlatedTokens.some((tokens) => {
    // If there is only one asset in the list, it means that it is a global correlated token
    const addresses = Object.keys(tokens)
    if (addresses.length === 1) {
      return addresses[0] === inputCurrencyAddress || addresses[0] === outputCurrencyAddress
      // If there are two tokens in the list, it means that it is a pair correlated token
    } else {
      return tokens[inputCurrencyAddress] && tokens[outputCurrencyAddress]
    }
  })
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
