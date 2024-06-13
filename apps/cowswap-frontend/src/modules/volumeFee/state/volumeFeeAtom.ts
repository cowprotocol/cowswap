import { atom } from 'jotai'

import { walletInfoAtom } from '@cowprotocol/wallet'
import { resolveFlexibleConfig, TradeType as WidgetTradeType } from '@cowprotocol/widget-lib'

import { injectedWidgetPartnerFeeAtom } from 'modules/injectedWidget'
import { tradeTypeAtom } from 'modules/trade'
import { TradeType } from 'modules/trade/types/TradeType'

import { VolumeFee } from '../types'

export const volumeFeeAtom = atom<VolumeFee | undefined>((get) => {
  const { chainId } = get(walletInfoAtom)
  const partnerFee = get(injectedWidgetPartnerFeeAtom)
  const tradeType = get(tradeTypeAtom)?.tradeType

  if (!tradeType || !partnerFee) {
    return undefined
  }

  return {
    bps: resolveFlexibleConfig(partnerFee.bps, chainId, TradeTypeMap[tradeType]),
    recipient: resolveFlexibleConfig(partnerFee.recipient, chainId, TradeTypeMap[tradeType]),
  }
})

const TradeTypeMap: Record<TradeType, WidgetTradeType> = {
  [TradeType.SWAP]: WidgetTradeType.SWAP,
  [TradeType.LIMIT_ORDER]: WidgetTradeType.LIMIT,
  [TradeType.ADVANCED_ORDERS]: WidgetTradeType.ADVANCED,
}
