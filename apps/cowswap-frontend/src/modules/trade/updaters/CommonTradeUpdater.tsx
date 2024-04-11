import { useSetupTradeState } from '../hooks/setupTradeState/useSetupTradeState'
import { useNotifyWidgetTrade } from '../hooks/useNotifyWidgetTrade'

export function CommonTradeUpdater() {
  useSetupTradeState()
  useNotifyWidgetTrade()

  return null
}
