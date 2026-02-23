import { useCallback, useMemo, useState } from 'react'

import { Command } from '@cowprotocol/types'
import { Badge, BadgeTypes, ModalHeader } from '@cowprotocol/ui'
import type { TradeType } from '@cowprotocol/widget-lib'

import { Trans, useLingui } from '@lingui/react/macro'
import IMAGE_CARET from 'assets/icon/caret.svg'
import SVG from 'react-inlinesvg'
import { useLocation } from 'react-router'

import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { Routes, RoutesValues } from 'common/constants/routes'
import { useMenuItems } from 'common/hooks/useMenuItems'

import * as styledEl from './styled'

import { useGetTradeUrlParams } from '../../hooks/useGetTradeUrlParams'
import { useTradeRouteContext } from '../../hooks/useTradeRouteContext'
import { useGetTradeStateByRoute } from '../../hooks/useTradeState'
import { getDefaultTradeRawState, TradeUrlParams } from '../../types'
import { addChainIdToRoute, parameterizeTradeRoute } from '../../utils/parameterizeTradeRoute'

interface MenuItemConfig {
  route: RoutesValues
  label: string
  badge?: string
  badgeImage?: string
  badgeType?: (typeof BadgeTypes)[keyof typeof BadgeTypes]
}

const WIDGET_QUERY_PARAMS_TO_PRESERVE = ['palette', 'theme'] as const

const TRADE_TYPE_TO_ROUTE: Record<TradeType, string> = {
  swap: Routes.SWAP,
  limit: Routes.LIMIT_ORDERS,
  advanced: Routes.ADVANCED_ORDERS,
  yield: Routes.YIELD,
}

function appendPreservedWidgetParams(path: string, paramsToPreserve: Array<[string, string]>): string {
  if (!paramsToPreserve.length) return path

  const [pathname, search = ''] = path.split('?')
  const queryParams = new URLSearchParams(search)

  paramsToPreserve.forEach(([key, value]) => {
    if (!queryParams.has(key)) {
      queryParams.set(key, value)
    }
  })

  const nextSearch = queryParams.toString()

  return nextSearch ? `${pathname}?${nextSearch}` : pathname
}

interface TradeWidgetLinksProps {
  isDropdown?: boolean
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function TradeWidgetLinks({ isDropdown = false }: TradeWidgetLinksProps) {
  const tradeContext = useTradeRouteContext()
  const location = useLocation()
  const [isDropdownVisible, setDropdownVisible] = useState(false)
  const { enabledTradeTypes } = useInjectedWidgetParams()
  const menuItems = useMenuItems()
  const getTradeStateByType = useGetTradeStateByRoute()
  const getTradeUrlParams = useGetTradeUrlParams()

  const handleMenuItemClick = useCallback((_item?: MenuItemConfig): void => {
    setDropdownVisible(false)
  }, [])

  const enabledItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (!enabledTradeTypes?.length) return true

      return enabledTradeTypes.some((type: TradeType) => TRADE_TYPE_TO_ROUTE[type] === item.route)
    })
  }, [menuItems, enabledTradeTypes])

  const preservedWidgetParams = useMemo((): Array<[string, string]> => {
    const currentSearchParams = new URLSearchParams(location.search)

    return WIDGET_QUERY_PARAMS_TO_PRESERVE.flatMap((queryParam): Array<[string, string]> => {
      const queryValue = currentSearchParams.get(queryParam)

      return queryValue ? [[queryParam, queryValue]] : []
    })
  }, [location.search])

  const menuItemsElements = useMemo(() => {
    return enabledItems.map((item) => {
      const isItemYield = item.route === Routes.YIELD
      const chainId = tradeContext.chainId

      const isCurrentPathYield = location.pathname.startsWith(addChainIdToRoute(Routes.YIELD, chainId))
      const itemTradeState = getTradeStateByType(item.route)
      const defaultState = chainId ? getDefaultTradeRawState(+chainId) : null

      const tradeUrlParams = isCurrentPathYield
        ? ({
            chainId,
            inputCurrencyId: itemTradeState.inputCurrencyId || defaultState?.inputCurrencyId || null,
            outputCurrencyId: itemTradeState.outputCurrencyId,
          } as TradeUrlParams)
        : getTradeUrlParams(item)

      const routePathWithoutWidgetParams =
        isItemYield && !isCurrentPathYield
          ? addChainIdToRoute(item.route, chainId)
          : parameterizeTradeRoute(tradeUrlParams, item.route, !isCurrentPathYield)
      const routePath = appendPreservedWidgetParams(routePathWithoutWidgetParams, preservedWidgetParams)

      const isActive = location.pathname.startsWith(routePath.split('?')[0])

      return (
        <MenuItem
          key={item.label}
          routePath={routePath}
          item={item}
          isActive={isActive}
          onClick={() => handleMenuItemClick(item)}
          isDropdownVisible={isDropdown && isDropdownVisible}
        />
      )
    })
  }, [
    isDropdown,
    isDropdownVisible,
    enabledItems,
    tradeContext,
    location.pathname,
    preservedWidgetParams,
    handleMenuItemClick,
    getTradeStateByType,
    getTradeUrlParams,
  ])

  const singleMenuItem = menuItemsElements.length === 1

  const selectedMenuItem = menuItemsElements.find((item) => item.props.isActive) || menuItemsElements[0]

  const { t } = useLingui()

  return isDropdown ? (
    <>
      <styledEl.MenuItem
        onClick={() => !singleMenuItem && setDropdownVisible(!isDropdownVisible)}
        isDropdownVisible={isDropdownVisible}
      >
        <styledEl.DropdownButton>
          {selectedMenuItem.props.item.label}
          {!singleMenuItem ? <SVG src={IMAGE_CARET} title={t`select`} /> : null}
        </styledEl.DropdownButton>
      </styledEl.MenuItem>

      {isDropdownVisible && (
        <styledEl.SelectMenu>
          <ModalHeader onBack={handleMenuItemClick}>
            <Trans>Trading mode</Trans>
          </ModalHeader>
          <styledEl.TradeWidgetContent>{menuItemsElements}</styledEl.TradeWidgetContent>
        </styledEl.SelectMenu>
      )}
    </>
  ) : (
    <styledEl.Wrapper>{menuItemsElements}</styledEl.Wrapper>
  )
}

const MenuItem = ({
  routePath,
  item,
  isActive,
  onClick,
  isDropdownVisible,
}: {
  isActive: boolean
  isDropdownVisible: boolean
  item: MenuItemConfig
  onClick: Command
  routePath: string
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}) => (
  <styledEl.MenuItem isActive={isActive} onClick={onClick} isDropdownVisible={isDropdownVisible}>
    <styledEl.Link to={routePath}>
      {item.label}
      {(!isActive && item.badgeImage) || item.badge ? (
        <Badge {...(item.badgeType && { type: item.badgeType })}>
          {item.badgeImage ? <SVG src={item.badgeImage} /> : item.badge}
        </Badge>
      ) : null}
    </styledEl.Link>
  </styledEl.MenuItem>
)
