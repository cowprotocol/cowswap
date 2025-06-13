import { atom } from 'jotai'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { walletInfoAtom } from '@cowprotocol/wallet'
import { resolveFlexibleConfig, TradeType as WidgetTradeType } from '@cowprotocol/widget-lib'

import { injectedWidgetPartnerFeeAtom } from 'modules/injectedWidget'
import { derivedTradeStateAtom, tradeTypeAtom } from 'modules/trade'
import { TradeType } from 'modules/trade/types/TradeType'

import { correlatedTokensAtom } from './correlatedTokensAtom'
import { cowSwapFeeAtom } from './cowswapFeeAtom'
import { safeAppFeeAtom } from './safeAppFeeAtom'

import { VolumeFee } from '../types'

export const volumeFeeAtom = atom<VolumeFee | undefined>((get) => {
  const cowSwapFee = get(cowSwapFeeAtom)
  const widgetPartnerFee = get(widgetPartnerFeeAtom)
  const safeAppFee = get(safeAppFeeAtom)
  const shouldSkipFee = get(shouldSkipFeeAtom)

  if (!widgetPartnerFee && shouldSkipFee) {
    return undefined
  }

  // CoW Swap Fee won't be enabled when in Widget mode, thus it takes precedence here
  return safeAppFee || cowSwapFee || widgetPartnerFee
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

  const bps = resolveFlexibleConfig(partnerFee.bps, chainId, TradeTypeMap[tradeType])
  const recipient = resolveFlexibleConfig(partnerFee.recipient, chainId, TradeTypeMap[tradeType])

  if (!bps || !recipient) return undefined

  return {
    volumeBps: bps,
    recipient,
  }
})

const TradeTypeMap: Record<TradeType, WidgetTradeType> = {
  [TradeType.SWAP]: WidgetTradeType.SWAP,
  [TradeType.LIMIT_ORDER]: WidgetTradeType.LIMIT,
  [TradeType.ADVANCED_ORDERS]: WidgetTradeType.ADVANCED,
  [TradeType.YIELD]: WidgetTradeType.YIELD,
}
