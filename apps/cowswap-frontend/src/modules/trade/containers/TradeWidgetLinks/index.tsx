import { useMemo, useState, useCallback } from 'react'

import { Command } from '@cowprotocol/types'
import { Badge } from '@cowprotocol/ui'
import type { TradeType } from '@cowprotocol/widget-lib'

import { Trans } from '@lingui/macro'
import IMAGE_CARET from 'assets/icon/caret.svg'
import SVG from 'react-inlinesvg'
import { matchPath, useLocation } from 'react-router-dom'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { ModalHeader } from 'modules/tokensList/pure/ModalHeader'

import { Routes, RoutesValues } from 'common/constants/routes'
import { useMenuItems } from 'common/hooks/useMenuItems'

import * as styledEl from './styled'

import { useTradeRouteContext } from '../../hooks/useTradeRouteContext'
import { parameterizeTradeRoute } from '../../utils/parameterizeTradeRoute'

interface MenuItemConfig {
  route: RoutesValues
  label: string
  badge?: string
}

const TRADE_TYPE_TO_ROUTE: Record<TradeType, string> = {
  swap: Routes.SWAP,
  limit: Routes.LIMIT_ORDER,
  advanced: Routes.ADVANCED_ORDERS,
}

interface TradeWidgetLinksProps {
  isDropdown?: boolean
}

export function TradeWidgetLinks({ isDropdown = false }: TradeWidgetLinksProps) {
  const tradeContext = useTradeRouteContext()
  const location = useLocation()
  const [isDropdownVisible, setDropdownVisible] = useState(false)
  const { enabledTradeTypes } = useInjectedWidgetParams()
  const menuItems = useMenuItems()

  const handleMenuItemClick = useCallback((_item?: MenuItemConfig): void => {
    setDropdownVisible(false)
  }, [])

  const enabledItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (!enabledTradeTypes?.length) return true

      return enabledTradeTypes.some((type: TradeType) => TRADE_TYPE_TO_ROUTE[type] === item.route)
    })
  }, [menuItems, enabledTradeTypes])

  const menuItemsElements: JSX.Element[] = useMemo(() => {
    return enabledItems.map((item) => {
      const routePath = parameterizeTradeRoute(tradeContext, item.route, true)
      const isActive = !!matchPath(location.pathname, routePath.split('?')[0])

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
  }, [isDropdown, isDropdownVisible, enabledItems, tradeContext, location.pathname, handleMenuItemClick])

  const singleMenuItem = menuItemsElements.length === 1

  const selectedMenuItem = menuItemsElements.find((item) => item.props.isActive) || menuItemsElements[0]

  return isDropdown ? (
    <>
      <styledEl.MenuItem
        onClick={() => !singleMenuItem && setDropdownVisible(!isDropdownVisible)}
        isDropdownVisible={isDropdownVisible}
      >
        <styledEl.Link to={selectedMenuItem.props.routePath || '#'}>
          {selectedMenuItem.props.item.label}
          {!singleMenuItem ? <SVG src={IMAGE_CARET} title="select" /> : null}
        </styledEl.Link>
      </styledEl.MenuItem>

      {isDropdownVisible && (
        <styledEl.SelectMenu>
          <ModalHeader onBack={handleMenuItemClick}>Trading mode</ModalHeader>
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
  routePath: string
  item: MenuItemConfig
  isActive: boolean
  onClick: Command
  isDropdownVisible: boolean
}) => (
  <styledEl.MenuItem isActive={isActive} onClick={onClick} isDropdownVisible={isDropdownVisible}>
    <styledEl.Link to={routePath}>
      <Trans>{item.label}</Trans>
      {!isActive && item.badge && (
        <Badge type="alert">
          <Trans>{item.badge}</Trans>
        </Badge>
      )}
    </styledEl.Link>
  </styledEl.MenuItem>
)
