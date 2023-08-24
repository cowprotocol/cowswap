import { useCallback } from 'react'

import { Trans } from '@lingui/macro'
import { matchPath, useLocation } from 'react-router-dom'

import { useTradeRouteContext } from 'modules/trade/hooks/useTradeRouteContext'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'

import { Routes, RoutesValues } from 'common/constants/routes'
import { FeatureGuard } from 'common/containers/FeatureGuard'

import * as styledEl from './styled'

interface MenuItemConfig {
  route: RoutesValues;
  label: string;
  featureGuard?: string;
  onClick?: () => void;
  badgeText?: string;
  badgeType?: BadgeType;
}

export type BadgeType = 'information' | 'success' | 'alert' | 'alert2' | 'default';

const MENU_ITEMS: MenuItemConfig[] = [
  { route: Routes.SWAP, label: 'Swap' },
  { route: Routes.LIMIT_ORDER, label: 'Limit' },
  {
    route: Routes.ADVANCED_ORDERS,
    label: 'TWAP',
    featureGuard: 'advancedOrdersEnabled',
    badgeText: 'NEW!',
    badgeType: 'alert2'
  },
]

interface TradeWidgetLinksProps {
  highlightedBadgeText?: string;
  highlightedBadgeType?: BadgeType;
}

export function TradeWidgetLinks({ highlightedBadgeText, highlightedBadgeType }: TradeWidgetLinksProps) {
  const tradeContext = useTradeRouteContext()
  const location = useLocation()

  const buildMenuItem = useCallback(
    (item: MenuItemConfig) => {
      const routePath = parameterizeTradeRoute(tradeContext, item.route);
  
      const isActive = !!matchPath(location.pathname, routePath);
  
      const menuItem = (
        <MenuItem 
          key={item.label} 
          routePath={routePath} 
          item={item} 
          isActive={isActive}
          badgeText={item.badgeText || highlightedBadgeText} 
          badgeType={item.badgeType || highlightedBadgeType}
        />
      );      
  
      return item.featureGuard ? (
        <FeatureGuard key={item.label} featureFlag={item.featureGuard}>
          {menuItem}
        </FeatureGuard>
      ) : (
        menuItem
      )
    },
    [location.pathname, tradeContext, highlightedBadgeText, highlightedBadgeType]
  );  

  return <styledEl.Wrapper>{MENU_ITEMS.map(buildMenuItem)}</styledEl.Wrapper>
}

const MenuItem = ({ routePath, item, isActive, badgeText, badgeType }: { 
  routePath: string; 
  item: MenuItemConfig; 
  isActive: boolean;
  badgeText?: string;
  badgeType?: BadgeType;
}) => (
  <styledEl.MenuItem isActive={isActive}>
    <styledEl.Link to={routePath}>
      <Trans>{item.label}</Trans>
      {item.featureGuard && badgeText && (
        <styledEl.Badge type={badgeType}>
          <Trans>{badgeText}</Trans>
        </styledEl.Badge>
      )}
    </styledEl.Link>
  </styledEl.MenuItem>
)
