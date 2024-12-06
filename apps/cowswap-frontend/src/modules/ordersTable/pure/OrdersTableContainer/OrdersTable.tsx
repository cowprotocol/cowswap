import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Media, QuestionTooltipIconWrapper, UI } from '@cowprotocol/ui'
import { Currency, Price } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { PendingOrdersPrices } from 'modules/orders/state/pendingOrdersPricesAtom'
import { SpotPricesKeyParams } from 'modules/orders/state/spotPricesAtom'
import { OrdersPermitStatus } from 'modules/permit'
import { BalancesAndAllowances } from 'modules/tokens'

import { ordersTableFeatures } from 'common/constants/featureFlags'
import { InvertRateControl } from 'common/pure/RateInfo'
import { CancellableOrder } from 'common/utils/isOrderCancellable'
import { isOrderOffChainCancellable } from 'common/utils/isOrderOffChainCancellable'

import { OrderRow } from './OrderRow'
import { CheckboxCheckmark, TableHeader, TableRowCheckbox, TableRowCheckboxWrapper } from './styled'
import { TableGroup } from './TableGroup'
import { OrderActions } from './types'

import { ORDERS_TABLE_PAGE_SIZE } from '../../const/tabs'
import { useGetBuildOrdersTableUrl } from '../../hooks/useGetBuildOrdersTableUrl'
import { getOrderParams } from '../../utils/getOrderParams'
import {
  getParsedOrderFromTableItem,
  isParsedOrder,
  OrderTableItem,
  tableItemsToOrders,
} from '../../utils/orderTableGroupUtils'
import { OrdersTablePagination } from '../OrdersTablePagination'

// TODO: move elements to styled.jsx

const TableBox = styled.div`
  display: block;
  border: none;
  padding: 0;
  position: relative;
  background: var(${UI.COLOR_PAPER});

  ${Media.upToLargeAlt()} {
    width: 100%;
    display: flex;
    flex-flow: column wrap;
  }
`

const TableInner = styled.div`
  display: block;
  width: inherit;
  height: inherit;
  padding: 0;
  overflow-y: hidden;
  overflow-x: auto;
  ${({ theme }) => theme.colorScrollbar};
`

const HeaderElement = styled.div<{ doubleRow?: boolean }>`
  height: 100%;
  padding: 0;
  font-size: 12px;
  line-height: 1.1;
  font-weight: 500;
  display: flex;
  align-items: ${({ doubleRow }) => (doubleRow ? 'flex-start' : 'center')};

  > span {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
  }

  ${({ doubleRow }) =>
    doubleRow &&
    `
    flex-flow: column wrap;
    justify-content: center;
    gap: 2px;

    > i {
      opacity: 0.7;
    }
  `}

  ${QuestionTooltipIconWrapper} {
    opacity: 0.5;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

    &:hover {
      opacity: 1;
    }
  }

  ${({ doubleRow }) =>
    doubleRow &&
    `
    flex-flow: column wrap;
    gap: 2px;

    > i {
      opacity: 0.7;
    }
  `}
`

const Rows = styled.div`
  display: block;
  ${({ theme }) => theme.colorScrollbar};

  ${Media.upToLargeAlt()} {
    display: flex;
    flex-flow: column wrap;
  }
`

const StyledInvertRateControl = styled(InvertRateControl)`
  display: inline-flex;
  margin-left: 5px;
`

export interface OrdersTableProps {
  isOpenOrdersTab: boolean
  allowsOffchainSigning: boolean
  currentPageNumber: number
  chainId: SupportedChainId
  pendingOrdersPrices: PendingOrdersPrices
  orders: OrderTableItem[]
  selectedOrders: CancellableOrder[]
  balancesAndAllowances: BalancesAndAllowances
  getSpotPrice: (params: SpotPricesKeyParams) => Price<Currency, Currency> | null
  orderActions: OrderActions
  ordersPermitStatus: OrdersPermitStatus
}

export function OrdersTable({
  isOpenOrdersTab,
  selectedOrders,
  allowsOffchainSigning,
  chainId,
  orders,
  pendingOrdersPrices,
  balancesAndAllowances,
  getSpotPrice,
  orderActions,
  currentPageNumber,
  ordersPermitStatus,
}: OrdersTableProps) {
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()
  const [isRateInverted, setIsRateInverted] = useState(false)
  const checkboxRef = useRef<HTMLInputElement>(null)

  const step = currentPageNumber * ORDERS_TABLE_PAGE_SIZE

  const ordersPage = orders.slice(step - ORDERS_TABLE_PAGE_SIZE, step)

  const onScroll = useCallback(() => {
    // Emit event to close OrderContextMenu
    document.body.dispatchEvent(new Event('mousedown', { bubbles: true }))
  }, [])

  const isRowSelectable = allowsOffchainSigning

  const selectedOrdersMap = useMemo(() => {
    if (!selectedOrders) return {}

    return selectedOrders.reduce(
      (acc, val) => {
        acc[val.id] = true

        return acc
      },
      {} as { [key: string]: true },
    )
  }, [selectedOrders])

  const cancellableOrders = useMemo(
    () => ordersPage.filter((item) => isOrderOffChainCancellable(getParsedOrderFromTableItem(item))),
    [ordersPage],
  )

  const allOrdersSelected = useMemo(() => {
    if (!cancellableOrders.length) return false

    return cancellableOrders.every((item) => selectedOrdersMap[getParsedOrderFromTableItem(item).id])
  }, [cancellableOrders, selectedOrdersMap])

  const getPageUrl = useCallback((index: number) => buildOrdersTableUrl({ pageNumber: index }), [buildOrdersTableUrl])

  // React doesn't support indeterminate attribute
  // Because of it, we have to use element reference
  useEffect(() => {
    const checkbox = checkboxRef.current

    if (!checkbox) return

    checkbox.indeterminate = !!selectedOrders.length && !allOrdersSelected
    checkbox.checked = allOrdersSelected
  }, [allOrdersSelected, selectedOrders.length])

  return (
    <>
      <TableBox>
        <TableInner onScroll={onScroll}>
          <TableHeader isOpenOrdersTab={isOpenOrdersTab} isRowSelectable={isRowSelectable}>
            {isRowSelectable && isOpenOrdersTab && (
              <HeaderElement>
                <TableRowCheckboxWrapper>
                  <TableRowCheckbox
                    ref={checkboxRef}
                    disabled={cancellableOrders.length === 0}
                    type="checkbox"
                    onChange={(event) =>
                      orderActions.toggleOrdersForCancellation(
                        event.target.checked ? tableItemsToOrders(ordersPage) : [],
                      )
                    }
                  />
                  <CheckboxCheckmark />
                </TableRowCheckboxWrapper>
              </HeaderElement>
            )}

            <HeaderElement>
              <Trans>Sell &#x2192; Buy</Trans>
            </HeaderElement>

            {isOpenOrdersTab && (
              <HeaderElement>
                <span>
                  <Trans>Fills at</Trans>
                </span>
              </HeaderElement>
            )}

            <HeaderElement>
              <span>
                <Trans>Limit price</Trans>
              </span>
              <StyledInvertRateControl onClick={() => setIsRateInverted(!isRateInverted)} />
            </HeaderElement>

            {isOpenOrdersTab && ordersTableFeatures.DISPLAY_EST_EXECUTION_PRICE && (
              <HeaderElement doubleRow>
                <span>
                  <Trans>Order executes at</Trans>
                </span>
                <i>
                  <Trans>Market price</Trans>
                </i>
              </HeaderElement>
            )}

            {isOpenOrdersTab && (
              <HeaderElement>
                <span>
                  <Trans>Market price</Trans>
                </span>
              </HeaderElement>
            )}

            {!isOpenOrdersTab && (
              <HeaderElement>
                <span>
                  <Trans>Execution price</Trans>
                </span>
              </HeaderElement>
            )}

            {isOpenOrdersTab && (
              <HeaderElement doubleRow>
                <Trans>Expiration</Trans>
                <i>
                  <Trans>Creation</Trans>
                </i>
              </HeaderElement>
            )}

            {/* {!isOpenOrdersTab && ordersTableFeatures.DISPLAY_EXECUTION_TIME && (
              <HeaderElement>
                <Trans>Execution time</Trans>
              </HeaderElement>
            )} */}

            <HeaderElement>
              <Trans>Filled</Trans>
            </HeaderElement>

            <HeaderElement>
              <Trans>Status</Trans>
            </HeaderElement>
            <HeaderElement>{/*Cancel order column*/}</HeaderElement>
          </TableHeader>

          <Rows>
            {ordersPage.map((item) => {
              const { inputToken, outputToken } = getParsedOrderFromTableItem(item)
              const spotPrice = getSpotPrice({
                chainId: chainId as SupportedChainId,
                sellTokenAddress: inputToken.address,
                buyTokenAddress: outputToken.address,
              })

              if (isParsedOrder(item)) {
                const order = item

                const orderParams = getOrderParams(chainId, balancesAndAllowances, order)

                const hasValidPendingPermit = ordersPermitStatus[order.id]

                return (
                  <OrderRow
                    key={order.id}
                    isRowSelectable={isRowSelectable}
                    isRowSelected={!!selectedOrdersMap[order.id]}
                    isOpenOrdersTab={isOpenOrdersTab}
                    order={order}
                    spotPrice={spotPrice}
                    prices={pendingOrdersPrices[order.id]}
                    orderParams={orderParams}
                    isRateInverted={isRateInverted}
                    orderActions={orderActions}
                    onClick={() => orderActions.selectReceiptOrder(order)}
                    hasValidPendingPermit={hasValidPendingPermit}
                  />
                )
              } else {
                return (
                  <TableGroup
                    item={item}
                    chainId={chainId}
                    balancesAndAllowances={balancesAndAllowances}
                    key={item.parent.id}
                    isRowSelectable={isRowSelectable}
                    isRowSelected={!!selectedOrdersMap[item.parent.id]}
                    isOpenOrdersTab={isOpenOrdersTab}
                    spotPrice={spotPrice}
                    prices={pendingOrdersPrices[item.parent.id]}
                    isRateInverted={isRateInverted}
                    orderActions={orderActions}
                  />
                )
              }
            })}
          </Rows>
        </TableInner>
      </TableBox>

      {/* Only show pagination if more than 1 page available */}
      {orders.length > ORDERS_TABLE_PAGE_SIZE && (
        <OrdersTablePagination
          getPageUrl={getPageUrl}
          pageSize={ORDERS_TABLE_PAGE_SIZE}
          totalCount={orders.length}
          currentPage={currentPageNumber}
        />
      )}
    </>
  )
}
