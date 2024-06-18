import { useSetupTradeState } from '../hooks/setupTradeState/useSetupTradeState'
import { useNotifyWidgetTrade } from '../hooks/useNotifyWidgetTrade'
import { useSetupTradeTypeInfo } from '../hooks/useSetupTradeTypeInfo'

export function CommonTradeUpdater() {
  useSetupTradeState()
  useNotifyWidgetTrade()
  useSetupTradeTypeInfo()

  return null
}
