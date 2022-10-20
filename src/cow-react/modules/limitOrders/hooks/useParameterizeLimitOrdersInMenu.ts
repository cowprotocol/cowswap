import { Routes } from '@cow/constants/routes'
import { useWeb3React } from '@web3-react/core'
import { useAtomValue } from 'jotai/utils'
import { limitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { mainMenuUrlOverridesAtom } from '@cow/modules/mainMenu/state/mainMenuUrlOverridesAtom'
import { MainMenuItemId } from '@cow/modules/mainMenu/constants/mainMenu'

export function useParameterizeLimitOrdersInMenu() {
  const { chainId } = useWeb3React()
  const { inputCurrencyId, outputCurrencyId } = useAtomValue(limitOrdersAtom)
  const overrideMainMenu = useSetAtom(mainMenuUrlOverridesAtom)

  useEffect(() => {
    const route = parameterizeLimitOrdersRoute(chainId, inputCurrencyId, outputCurrencyId)

    overrideMainMenu({ [MainMenuItemId.LIMIT_ORDERS]: route })
  }, [overrideMainMenu, chainId, inputCurrencyId, outputCurrencyId])
}

/**
 * When input currency is not set and user select output currency, we build a link like:
 * /limit-orders/_/DAI
 */
export function parameterizeLimitOrdersRoute(
  chainId: number | null | undefined,
  inputCurrencyId: string | null,
  outputCurrencyId: string | null
): string {
  return Routes.LIMIT_ORDER.replace('/:chainId?', chainId ? `/${chainId}` : '')
    .replace('/:inputCurrencyId?', inputCurrencyId ? `/${inputCurrencyId}` : '/_')
    .replace('/:outputCurrencyId?', outputCurrencyId ? `/${outputCurrencyId}` : '')
}
