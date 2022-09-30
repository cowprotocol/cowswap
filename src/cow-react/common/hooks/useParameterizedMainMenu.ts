import { BasicMenuLink, isBasicMenuLink, MAIN_MENU, MenuTreeItem } from 'cow-react/modules/mainMenu/constants/mainMenu'
import { useParameterizeLimitOrdersRoute } from 'cow-react/modules/limitOrders/hooks/useParameterizeLimitOrdersRoute'
import { Routes } from 'constants/routes'
import { useMemo } from 'react'

export function useParameterizedMainMenu(): MenuTreeItem[] {
  const limitOrdersRouteWithParams = useParameterizeLimitOrdersRoute()

  return useMemo(() => {
    const copy: MenuTreeItem[] = JSON.parse(JSON.stringify(MAIN_MENU))

    const limitOrdersRoute = copy.filter<BasicMenuLink>(isBasicMenuLink).find((item) => item.url === Routes.LIMIT_ORDER)

    if (limitOrdersRoute) {
      limitOrdersRoute.url = limitOrdersRouteWithParams
    }

    return copy
  }, [limitOrdersRouteWithParams])
}
