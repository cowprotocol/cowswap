import { useState } from 'react'

import { Trans } from '@lingui/macro'
import IMAGE_CARRET from 'assets/icon/carret.svg'
import SVG from 'react-inlinesvg'
import { matchPath, useLocation } from 'react-router-dom'

import { useTradeRouteContext } from 'modules/trade/hooks/useTradeRouteContext'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'

import { Routes, RoutesValues } from 'common/constants/routes'
import { FeatureGuard } from 'common/containers/FeatureGuard'

import * as styledEl from './styled'

interface MenuItemConfig {
  route: RoutesValues
  label: string
  featureGuard?: string
  onClick?: () => void
  badgeText?: string
  badgeType?: BadgeType
}

export type BadgeType = 'information' | 'success' | 'alert' | 'alert2' | 'default'

const MENU_ITEMS: MenuItemConfig[] = [
  { route: Routes.SWAP, label: 'Swap' },
  { route: Routes.LIMIT_ORDER, label: 'Limit' },
  {
    route: Routes.ADVANCED_ORDERS,
    label: 'TWAP',
    badgeText: 'NEW!',
    badgeType: 'alert2',
  },
]

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

  const handleMenuItemClick = (_item: MenuItemConfig) => {
    if (menuItems.length === 1) return
    setDropdownVisible(false)
  }

  const menuItems = MENU_ITEMS.map((item) => {
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

  const singleMenuItem = menuItems.length === 1;

  return isDropdown ? (
    <>
      <styledEl.MenuItem onClick={() => !singleMenuItem && setDropdownVisible(!isDropdownVisible)} isDropdownVisible={isDropdownVisible}>
        <styledEl.Link to={menuItems.find((item) => item.props.isActive)?.props.routePath || '#'}>
          <Trans>
            {menuItems.find((item) => item.props.isActive)?.props.item.label}
            {!singleMenuItem ? <SVG src={IMAGE_CARRET} title="select" /> : null}
          </Trans>
        </styledEl.Link>
      </styledEl.MenuItem>
      {isDropdownVisible && <styledEl.SelectMenu>{menuItems}</styledEl.SelectMenu>}
    </>
  ) : (
    <styledEl.Wrapper>{menuItems}</styledEl.Wrapper>
  );
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
  onClick: () => void
  isDropdownVisible: boolean
}) => (
  <styledEl.MenuItem isActive={isActive} onClick={onClick} isDropdownVisible={isDropdownVisible}>
    <styledEl.Link to={routePath}>
      <Trans>{item.label}</Trans>
      {badgeText && (
        <styledEl.Badge type={badgeType}>
          <Trans>{badgeText}</Trans>
        </styledEl.Badge>
      )}
    </styledEl.Link>
  </styledEl.MenuItem>
)
