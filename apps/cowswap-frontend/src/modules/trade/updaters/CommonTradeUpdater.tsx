import { useSetupTradeState } from '../hooks/setupTradeState/useSetupTradeState'
import { useNotifyWidgetTrade } from '../hooks/useNotifyWidgetTrade'
import { useSetupTradeTypeInfo } from '../hooks/useSetupTradeTypeInfo'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CommonTradeUpdater() {
  useSetupTradeState()
  useNotifyWidgetTrade()
  useSetupTradeTypeInfo()

  return null
}
