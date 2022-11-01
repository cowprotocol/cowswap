import { Routes } from '@cow/constants/routes'
import { useWeb3React } from '@web3-react/core'
import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { updateMainMenuUrlOverridesAtom, MainMenuItemId } from '@cow/modules/mainMenu'
import { TradeCurrenciesIds } from '@cow/modules/trade/types/TradeState'
import { parameterizeTradeRoute } from '@cow/modules/trade/utils/parameterizeTradeRoute'

export function useParameterizeTradeInMenu(route: Routes, menuItemId: MainMenuItemId, state: TradeCurrenciesIds): void {
  const { chainId } = useWeb3React()
  const overrideMainMenu = useSetAtom(updateMainMenuUrlOverridesAtom)

  useEffect(() => {
    const { inputCurrencyId, outputCurrencyId } = state

    overrideMainMenu({
      [menuItemId]: parameterizeTradeRoute(chainId, inputCurrencyId, outputCurrencyId, route),
    })
  }, [menuItemId, route, overrideMainMenu, chainId, state])
}
