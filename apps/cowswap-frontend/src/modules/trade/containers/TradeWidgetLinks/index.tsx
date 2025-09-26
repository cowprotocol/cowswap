import React, { JSX, useCallback, useMemo, useState } from 'react'

import { useExtractText } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { Badge, BadgeTypes } from '@cowprotocol/ui'
import type { TradeType } from '@cowprotocol/widget-lib'

import { MessageDescriptor } from '@lingui/core'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import IMAGE_CARET from 'assets/icon/caret.svg'
import SVG from 'react-inlinesvg'
import { useLocation } from 'react-router'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { ModalHeader } from 'modules/tokensList/pure/ModalHeader'

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
  label: string | MessageDescriptor
  badge?: string | MessageDescriptor
  badgeImage?: string
  badgeType?: (typeof BadgeTypes)[keyof typeof BadgeTypes]
}

const TRADE_TYPE_TO_ROUTE: Record<TradeType, string> = {
  swap: Routes.SWAP,
  limit: Routes.LIMIT_ORDER,
  advanced: Routes.ADVANCED_ORDERS,
  yield: Routes.YIELD,
}

interface TradeWidgetLinksProps {
  isDropdown?: boolean
}

interface TradeWidgetMenuItemProps {
  dropdownVisible: boolean
  isDropdown: boolean
  menuItemsElements: JSX.Element[]
  onBack: (_item?: MenuItemConfig) => void
  onClick: () => false | void
  selectedMenuItem: JSX.Element
  singleMenuItem: boolean
}

const TradeWidgetMenuItem: React.FC<TradeWidgetMenuItemProps> = ({
  isDropdown,
  onClick,
  dropdownVisible,
  selectedMenuItem,
  singleMenuItem,
  onBack,
  menuItemsElements,
}) => {
  return isDropdown ? (
    <>
      <styledEl.MenuItem onClick={onClick} isDropdownVisible={dropdownVisible}>
        <styledEl.DropdownButton>
          {selectedMenuItem.props.item.label}
          {!singleMenuItem ? <SVG src={IMAGE_CARET} title={t`select`} /> : null}
        </styledEl.DropdownButton>
      </styledEl.MenuItem>

      {dropdownVisible && (
        <styledEl.SelectMenu>
          <ModalHeader onBack={onBack}>
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

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradeWidgetLinks({ isDropdown = false }: TradeWidgetLinksProps) {
  const { extractTextFromStringOrI18nDescriptor } = useExtractText()
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

      const routePath =
        isItemYield && !isCurrentPathYield
          ? addChainIdToRoute(item.route, chainId)
          : parameterizeTradeRoute(tradeUrlParams, item.route, !isCurrentPathYield)

      const isActive = location.pathname.startsWith(routePath.split('?')[0])

      return (
        <MenuItem
          key={extractTextFromStringOrI18nDescriptor(item.label)}
          routePath={routePath}
          item={item}
          isActive={isActive}
          onClick={() => handleMenuItemClick(item)}
          isDropdownVisible={isDropdown && isDropdownVisible}
        />
      )
    })
  }, [
    enabledItems,
    extractTextFromStringOrI18nDescriptor,
    getTradeStateByType,
    getTradeUrlParams,
    handleMenuItemClick,
    isDropdown,
    isDropdownVisible,
    location.pathname,
    tradeContext.chainId,
  ])
  const singleMenuItem = menuItemsElements.length === 1
  const selectedMenuItem = menuItemsElements.find((item) => item.props.isActive) || menuItemsElements[0]

  return (
    <TradeWidgetMenuItem
      isDropdown={isDropdown}
      onClick={() => !singleMenuItem && setDropdownVisible(!isDropdownVisible)}
      dropdownVisible={isDropdownVisible}
      selectedMenuItem={selectedMenuItem}
      singleMenuItem={singleMenuItem}
      onBack={handleMenuItemClick}
      menuItemsElements={menuItemsElements}
    />
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
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}) => {
  const { extractTextFromStringOrI18nDescriptor } = useExtractText()

  return (
    <styledEl.MenuItem isActive={isActive} onClick={onClick} isDropdownVisible={isDropdownVisible}>
      <styledEl.Link to={routePath}>
        {extractTextFromStringOrI18nDescriptor(item.label)}
        {(!isActive && item.badgeImage) || item.badge ? (
          <Badge {...(item.badgeType && { type: item.badgeType })}>
            {item.badgeImage ? (
              <SVG src={item.badgeImage} />
            ) : item.badge ? (
              <>{extractTextFromStringOrI18nDescriptor(item.badge)}</>
            ) : null}
          </Badge>
        ) : null}
      </styledEl.Link>
    </styledEl.MenuItem>
  )
}
