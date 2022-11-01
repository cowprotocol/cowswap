import { Routes } from '@cow/constants/routes'
import { MainMenuItemId } from '@cow/modules/mainMenu/constants/mainMenu'
import { useParameterizeTradeInMenu } from './hooks/useParameterizeTradeInMenu'
import { useLimitOrdersTradeState, useSwapTradeState, useTradeState } from '../../hooks/useTradeState'

export function TradeMenuUpdater() {
  const tradeState = useTradeState()
  const swapTradeState = useSwapTradeState()
  const limitOrdersTradeState = useLimitOrdersTradeState()

  useParameterizeTradeInMenu(
    Routes.LIMIT_ORDER,
    MainMenuItemId.LIMIT_ORDERS,
    tradeState?.state || limitOrdersTradeState
  )
  useParameterizeTradeInMenu(Routes.SWAP, MainMenuItemId.SWAP, tradeState?.state || swapTradeState)

  return null
}
