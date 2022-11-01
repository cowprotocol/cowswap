import { limitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { useAtomValue } from 'jotai/utils'
import { Routes } from '@cow/constants/routes'
import { MainMenuItemId } from '@cow/modules/mainMenu/constants/mainMenu'
import { useSwapState } from 'state/swap/hooks'
import { useParameterizeTradeInMenu } from '@cow/modules/limitOrders/hooks/useParameterizeTradeInMenu'

export function TradeMenuUpdater() {
  const limitOrdersState = useAtomValue(limitOrdersAtom)
  const swapState = useSwapState()

  useParameterizeTradeInMenu(Routes.LIMIT_ORDER, MainMenuItemId.LIMIT_ORDERS, limitOrdersState)
  useParameterizeTradeInMenu(Routes.SWAP, MainMenuItemId.SWAP, {
    inputCurrencyId: swapState.INPUT.currencyId || null,
    outputCurrencyId: swapState.OUTPUT.currencyId || null,
  })

  return null
}
