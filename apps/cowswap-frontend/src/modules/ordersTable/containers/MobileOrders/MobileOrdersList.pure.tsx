import { useAtomValue } from 'jotai'
import { ReactNode, useMemo } from 'react'

import { BalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { OrderTabId, TabOrderTypes } from 'entities/routes/routes.atom'

import { OrderStatus } from 'legacy/state/orders/actions'

import { useIsFallbackHandlerRequired } from 'modules/twap'

import { MobileOrderCard } from './MobileOrderCard.pure'
import * as styledEl from './MobileOrders.styled'
import { MobileOrdersEmptyState } from './MobileOrdersEmptyState.pure'

import { useGetBuildOrdersTableUrl } from '../../hooks/url/useGetBuildOrdersTableUrl'
import { useOrderActions } from '../../hooks/useOrderActions'
import { WarningReason } from '../../pure/OrderEstimatedExecutionPrice/orderEstimatedExecutionPrice.constants'
import { LoadMoreOrdersSection } from '../../pure/OrdersTable/LoadMore/Section/LoadMoreOrdersSection'
import { OrdersTablePagination } from '../../pure/OrdersTable/Pagination/OrdersTablePagination.pure'
import { ordersTableStateAtom } from '../../state/ordersTable.atoms'
import { OrderTableItem } from '../../state/ordersTable.types'
import { ordersTablePageAtom, ordersTableTabIdAtom } from '../../state/params/ordersTableParams.atom'
import { ORDERS_TABLE_PAGE_SIZE } from '../../state/params/ordersTableParams.constants'
import { getIsFallbackHandlerUnfillable } from '../../utils/getIsFallbackHandlerUnfillable'
import { getOrderParams } from '../../utils/getOrderParams'
import {
  groupOrdersByDate,
  OrdersDateGroup,
  shouldShowOrdersDateGroupHeading,
} from '../../utils/groupOrdersByDate.utils'
import { getParsedOrderFromTableItem, isParsedOrder } from '../../utils/orderTableGroupUtils'

export interface MobileOrdersListProps {
  orderType: TabOrderTypes
  hasActiveFilters: boolean
  onClose(): void
  onResetFilters(): void
}

interface DateGroupLabelProps {
  group: OrdersDateGroup
}

export function MobileOrdersList({
  orderType,
  hasActiveFilters,
  onClose,
  onResetFilters,
}: MobileOrdersListProps): ReactNode {
  const { t } = useLingui()
  const { chainId } = useWalletInfo()
  const isFallbackHandlerRequired = useIsFallbackHandlerRequired()
  const { balancesAndAllowances, orders, filteredOrders } = useAtomValue(ordersTableStateAtom)
  const currentTab = useAtomValue(ordersTableTabIdAtom)
  const currentPage = useAtomValue(ordersTablePageAtom) ?? 1
  const orderActions = useOrderActions()
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()
  const pageStart = (currentPage - 1) * ORDERS_TABLE_PAGE_SIZE
  const ordersPage = filteredOrders.slice(pageStart, pageStart + ORDERS_TABLE_PAGE_SIZE)
  const totalFilteredOrders = filteredOrders.length
  const firstOrderNumber = pageStart + 1
  const pageEnd = Math.min(pageStart + ORDERS_TABLE_PAGE_SIZE, totalFilteredOrders)
  const lastPageNumber = Math.max(1, Math.ceil(totalFilteredOrders / ORDERS_TABLE_PAGE_SIZE))
  const groupedHistoryOrders = useMemo(
    () => groupOrdersByDate(ordersPage, (item) => getParsedOrderFromTableItem(item).creationTime),
    [ordersPage],
  )

  if (ordersPage.length === 0) {
    return (
      <MobileOrdersEmptyState
        currentTab={currentTab}
        orderType={orderType}
        hasOrders={orders.length > 0}
        hasActiveFilters={hasActiveFilters}
        onClose={onClose}
        onResetFilters={onResetFilters}
      />
    )
  }

  return (
    <styledEl.List>
      {currentTab === OrderTabId.HISTORY
        ? groupedHistoryOrders.map((group) => {
            const showHeading = shouldShowOrdersDateGroupHeading(group.id, groupedHistoryOrders.length)

            return (
              <styledEl.DateGroup key={group.id} aria-labelledby={showHeading ? `orders-${group.id}` : undefined}>
                {showHeading ? (
                  <styledEl.DateHeading id={`orders-${group.id}`}>
                    <DateGroupLabel group={group.id} />
                  </styledEl.DateHeading>
                ) : null}

                {group.items.map((item) => {
                  const order = getParsedOrderFromTableItem(item)
                  return (
                    <MobileOrderCard
                      key={order.id}
                      item={item}
                      dateGroup={group.id}
                      warningReason={getOrderWarningReason(
                        item,
                        chainId,
                        balancesAndAllowances,
                        isFallbackHandlerRequired,
                      )}
                      onOpen={() => orderActions.selectReceiptOrder(order)}
                    />
                  )
                })}
              </styledEl.DateGroup>
            )
          })
        : ordersPage.map((item) => {
            const order = getParsedOrderFromTableItem(item)
            return (
              <MobileOrderCard
                key={order.id}
                item={item}
                warningReason={getOrderWarningReason(item, chainId, balancesAndAllowances, isFallbackHandlerRequired)}
                onOpen={() => orderActions.selectReceiptOrder(order)}
              />
            )
          })}

      {totalFilteredOrders > ORDERS_TABLE_PAGE_SIZE ? (
        <styledEl.PaginationSection>
          <styledEl.PaginationRange>
            {t`Showing ${firstOrderNumber}–${pageEnd} of ${totalFilteredOrders} loaded orders`}
          </styledEl.PaginationRange>
          <OrdersTablePagination
            getPageUrl={(index) => buildOrdersTableUrl({ pageNumber: index })}
            pageSize={ORDERS_TABLE_PAGE_SIZE}
            totalCount={totalFilteredOrders}
            currentPage={currentPage}
          />
        </styledEl.PaginationSection>
      ) : null}

      {currentTab === OrderTabId.OPEN && currentPage === lastPageNumber ? (
        <LoadMoreOrdersSection totalOpenOrders={totalFilteredOrders} orderType={orderType} />
      ) : null}
    </styledEl.List>
  )
}

function DateGroupLabel({ group }: DateGroupLabelProps): ReactNode {
  const { t } = useLingui()

  switch (group) {
    case OrdersDateGroup.TODAY:
      return t`Today`
    case OrdersDateGroup.YESTERDAY:
      return t`Yesterday`
    case OrdersDateGroup.EARLIER_THIS_WEEK:
      return t`Earlier this week`
    case OrdersDateGroup.EARLIER_THIS_MONTH:
      return t`Earlier this month`
    case OrdersDateGroup.OLDER:
      return t`Older`
  }

  return null
}

function getBalanceOrAllowanceWarning(
  order: ReturnType<typeof getParsedOrderFromTableItem>,
  chainId: SupportedChainId,
  balancesAndAllowances: BalancesAndAllowances,
): WarningReason | undefined {
  if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.SCHEDULED) return undefined

  const { hasEnoughAllowance, hasEnoughBalance } = getOrderParams(chainId, balancesAndAllowances, order)

  return hasEnoughBalance === false
    ? WarningReason.Balance
    : hasEnoughAllowance === false
      ? WarningReason.Allowance
      : undefined
}

function getOrderWarningReason(
  item: OrderTableItem,
  chainId: SupportedChainId | undefined,
  balancesAndAllowances: BalancesAndAllowances,
  isFallbackHandlerRequired: boolean,
): WarningReason | undefined {
  if (!chainId) return undefined

  if (isParsedOrder(item)) return getBalanceOrAllowanceWarning(item, chainId, balancesAndAllowances)

  if (getIsFallbackHandlerUnfillable(item.parent.status, isFallbackHandlerRequired)) {
    return WarningReason.FallbackHandler
  }

  const childWarnings = item.children.map((child) =>
    getBalanceOrAllowanceWarning(child, chainId, balancesAndAllowances),
  )

  return childWarnings.includes(WarningReason.Balance)
    ? WarningReason.Balance
    : childWarnings.includes(WarningReason.Allowance)
      ? WarningReason.Allowance
      : undefined
}
