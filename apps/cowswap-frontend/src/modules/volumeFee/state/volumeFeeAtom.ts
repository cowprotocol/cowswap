import { atom } from 'jotai'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { walletInfoAtom } from '@cowprotocol/wallet'
import { resolveFlexibleConfig, TradeType as WidgetTradeType } from '@cowprotocol/widget-lib'

import { injectedWidgetPartnerFeeAtom } from 'modules/injectedWidget'
import { derivedTradeStateAtom, tradeTypeAtom } from 'modules/trade'
import { TradeType } from 'modules/trade/types/TradeType'

import { cowSwapFeeAtom } from './cowswapFeeAtom'
import { safeAppFeeAtom } from './safeAppFeeAtom'
import { taxFreeAssetsAtom } from './taxFreeAssetsAtom'

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
  const taxFreeAssetsState = get(taxFreeAssetsAtom)

  if (!tradeState) return false

  const taxFreeAssets = taxFreeAssetsState[chainId]

  if (!taxFreeAssets) return false

  const { inputCurrency, outputCurrency } = tradeState

  if (!inputCurrency || !outputCurrency) return false

  const inputCurrencyAddress = getCurrencyAddress(inputCurrency).toLowerCase()
  const outputCurrencyAddress = getCurrencyAddress(outputCurrency).toLowerCase()

  return taxFreeAssets.some((assets) => {
    // If there is only one asset in the list, it means that it is a global tax free asset
    if (assets.length === 1) {
      return assets[0] === inputCurrencyAddress || assets[0] === outputCurrencyAddress
      // If there are two assets in the list, it means that it is a pair tax free asset
    } else {
      return assets.includes(inputCurrencyAddress) && assets.includes(outputCurrencyAddress)
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
    bps,
    recipient,
  }
})

const TradeTypeMap: Record<TradeType, WidgetTradeType> = {
  [TradeType.SWAP]: WidgetTradeType.SWAP,
  [TradeType.LIMIT_ORDER]: WidgetTradeType.LIMIT,
  [TradeType.ADVANCED_ORDERS]: WidgetTradeType.ADVANCED,
  [TradeType.YIELD]: WidgetTradeType.YIELD,
}
