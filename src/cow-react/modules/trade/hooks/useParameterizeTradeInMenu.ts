import { Routes } from '@cow/constants/routes'
import { useWeb3React } from '@web3-react/core'
import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { updateMainMenuUrlOverridesAtom, MainMenuItemId } from '@cow/modules/mainMenu'
import { TradeCurrenciesIds } from '../types/TradeState'

export function useParameterizeTradeInMenu(route: Routes, menuItemId: MainMenuItemId, state: TradeCurrenciesIds): void {
  const { chainId } = useWeb3React()
  const { inputCurrencyId, outputCurrencyId } = state
  const overrideMainMenu = useSetAtom(updateMainMenuUrlOverridesAtom)

  useEffect(() => {
    overrideMainMenu({
      [menuItemId]: parameterizeTradeRoute(chainId, inputCurrencyId, outputCurrencyId, route),
    })
  }, [menuItemId, route, overrideMainMenu, chainId, inputCurrencyId, outputCurrencyId])
}

/**
 * When input currency is not set and user select output currency, we build a link like:
 * /limit-orders/_/DAI
 */
export function parameterizeTradeRoute(
  chainId: number | null | undefined,
  inputCurrencyId: string | null,
  outputCurrencyId: string | null,
  route: Routes
): string {
  return route
    .replace('/:chainId?', chainId ? `/${chainId}` : '')
    .replace('/:inputCurrencyId?', inputCurrencyId ? `/${inputCurrencyId}` : '/_')
    .replace('/:outputCurrencyId?', outputCurrencyId ? `/${outputCurrencyId}` : '')
}
