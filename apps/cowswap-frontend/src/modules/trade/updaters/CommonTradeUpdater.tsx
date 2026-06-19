import { useSetupTradeState } from '../hooks/setupTradeState/useSetupTradeState'
import { useNotifyWidgetTrade } from '../hooks/useNotifyWidgetTrade'
import { useSetupTradeTypeInfo } from '../hooks/useSetupTradeTypeInfo'

interface CommonTradeUpdaterProps {
  enableSellEqBuy?: boolean
}

export function CommonTradeUpdater({ enableSellEqBuy }: CommonTradeUpdaterProps): null {
  useSetupTradeState(enableSellEqBuy)
  useNotifyWidgetTrade()
  useSetupTradeTypeInfo()

  return null
}
