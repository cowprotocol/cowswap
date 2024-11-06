import { useSetupTradeState } from '../hooks/setupTradeState/useSetupTradeState'
import { useNotifyWidgetTrade } from '../hooks/useNotifyWidgetTrade'
import { useSetupTradeTypeInfo } from '../hooks/useSetupTradeTypeInfo'

export function CommonTradeUpdater(props: { allowSameToken: boolean }): null {
  useSetupTradeState(props)
  useNotifyWidgetTrade()
  useSetupTradeTypeInfo()

  return null
}
