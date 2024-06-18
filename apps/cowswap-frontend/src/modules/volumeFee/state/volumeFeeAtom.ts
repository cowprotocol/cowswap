import { atom } from 'jotai'

import { walletInfoAtom } from '@cowprotocol/wallet'
import { resolveFlexibleConfig, TradeType as WidgetTradeType } from '@cowprotocol/widget-lib'

import { injectedWidgetPartnerFeeAtom } from 'modules/injectedWidget'
import { tradeTypeAtom } from 'modules/trade'
import { TradeType } from 'modules/trade/types/TradeType'

import { featureFlagsAtom } from 'common/state/featureFlagsState'

import { cowSwapFeeAtom } from './cowswapFeeAtom'

import { VolumeFee } from '../types'

export const volumeFeeAtom = atom<VolumeFee | undefined>((get) => {
  const featureFlags = get(featureFlagsAtom)
  const cowSwapFee = get(cowSwapFeeAtom)
  const widgetPartnerFee = get(widgetPartnerFeeAtom)

  if (featureFlags.isCowSwapFeeEnabled) {
    return cowSwapFee || widgetPartnerFee
  }

  return widgetPartnerFee
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
}
