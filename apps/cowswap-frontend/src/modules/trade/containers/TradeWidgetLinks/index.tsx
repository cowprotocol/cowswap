import { useState } from 'react'

import { Command } from '@cowprotocol/types'
import { BadgeType } from '@cowprotocol/ui'
import type { TradeType } from '@cowprotocol/widget-lib'

import { Trans } from '@lingui/macro'
import IMAGE_CARRET from 'assets/icon/carret.svg'
import SVG from 'react-inlinesvg'
import { matchPath, useLocation } from 'react-router-dom'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
// TODO: extract the component to common
import { ModalHeader } from 'modules/tokensList/pure/ModalHeader'

import { Routes, RoutesValues } from 'common/constants/routes'
import { FeatureGuard } from 'common/containers/FeatureGuard'

import * as styledEl from './styled'

import { useTradeRouteContext } from '../../hooks/useTradeRouteContext'
import { parameterizeTradeRoute } from '../../utils/parameterizeTradeRoute'

interface MenuItemConfig {
  route: RoutesValues
  label: string
  featureGuard?: string
  onClick?: Command
  badgeText?: string
  badgeType?: BadgeType
}

const MENU_ITEMS: MenuItemConfig[] = [
  { route: Routes.SWAP, label: 'Swap' },
  { route: Routes.LIMIT_ORDER, label: 'Limit' },
  { route: Routes.ADVANCED_ORDERS, label: 'TWAP' },
]

const TRADE_TYPE_TO_ROUTE: Record<TradeType, string> = {
  swap: Routes.SWAP,
  limit: Routes.LIMIT_ORDER,
  advanced: Routes.ADVANCED_ORDERS,
}

interface TradeWidgetLinksProps {
  highlightedBadgeText?: string
  highlightedBadgeType?: BadgeType
  isDropdown?: boolean
}

export function TradeWidgetLinks({
  highlightedBadgeText,
  highlightedBadgeType,
  isDropdown = false,
}: TradeWidgetLinksProps) {
  const tradeContext = useTradeRouteContext()
  const location = useLocation()
  const [isDropdownVisible, setDropdownVisible] = useState(false)
  const { enabledTradeTypes } = useInjectedWidgetParams()

  const handleMenuItemClick = (_item?: MenuItemConfig) => {
    if (menuItems.length === 1) return
    setDropdownVisible(false)
  }

  const enabledItems = MENU_ITEMS.filter((item) => {
    if (!enabledTradeTypes?.length) return true

    return enabledTradeTypes.some((type: TradeType) => TRADE_TYPE_TO_ROUTE[type] === item.route)
  })

  const menuItems = enabledItems.map((item) => {
    const routePath = parameterizeTradeRoute(tradeContext, item.route)
    const isActive = !!matchPath(location.pathname, routePath)

    const menuItem = (
      <MenuItem
        key={item.label}
        routePath={routePath}
        item={item}
        isActive={isActive}
        badgeText={item.badgeText || highlightedBadgeText}
        badgeType={item.badgeType || highlightedBadgeType}
        onClick={() => handleMenuItemClick(item)}
        isDropdownVisible={isDropdownVisible}
      />
    )

    return item.featureGuard ? (
      <FeatureGuard key={item.label} featureFlag={item.featureGuard}>
        {menuItem}
      </FeatureGuard>
    ) : (
      menuItem
    )
  })

  const singleMenuItem = menuItems.length === 1

  return isDropdown ? (
    <>
      <styledEl.MenuItem
        onClick={() => !singleMenuItem && setDropdownVisible(!isDropdownVisible)}
        isDropdownVisible={isDropdownVisible}
      >
        <styledEl.Link to={menuItems.find((item) => item.props.isActive)?.props.routePath || '#'}>
          <Trans>
            {menuItems.find((item) => item.props.isActive)?.props.item.label}
            {!singleMenuItem ? <SVG src={IMAGE_CARRET} title="select" /> : null}
          </Trans>
        </styledEl.Link>
      </styledEl.MenuItem>

      {isDropdownVisible && (
        <styledEl.SelectMenu>
          <ModalHeader onBack={handleMenuItemClick}>Trading mode</ModalHeader>
          <styledEl.TradeWidgetContent>{menuItems}</styledEl.TradeWidgetContent>
        </styledEl.SelectMenu>
      )}
    </>
  ) : (
    <styledEl.Wrapper>{menuItems}</styledEl.Wrapper>
  )
}

const MenuItem = ({
  routePath,
  item,
  isActive,
  badgeText,
  badgeType,
  onClick,
  isDropdownVisible,
}: {
  routePath: string
  item: MenuItemConfig
  isActive: boolean
  badgeText?: string
  badgeType?: BadgeType
  onClick: Command
  isDropdownVisible: boolean
}) => (
  <styledEl.MenuItem isActive={isActive} onClick={onClick} isDropdownVisible={isDropdownVisible}>
    <styledEl.Link to={routePath}>
      <Trans>{item.label}</Trans>
      {!isActive && badgeText && (
        <styledEl.Badge type={badgeType}>
          <Trans>{badgeText}</Trans>
        </styledEl.Badge>
      )}
    </styledEl.Link>
  </styledEl.MenuItem>
)
