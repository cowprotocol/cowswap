import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'
import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react'
import { OrdersTablePagination } from './OrdersTablePagination'
import { OrderRow } from './OrderRow'
import { InvertRateControl } from 'common/pure/RateInfo'
import { BalancesAndAllowances } from 'modules/tokens'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { transparentize } from 'polished'
import { LIMIT_ORDERS_PAGE_SIZE } from 'modules/limitOrders/const/limitOrdersTabs'
import { getOrderParams } from './utils/getOrderParams'
import { ordersSorter } from 'modules/limitOrders/utils/ordersSorter'
import QuestionHelper from 'legacy/components/QuestionHelper'
import { RateTooltipHeader } from 'modules/limitOrders/pure/ExecutionPriceTooltip'
import { ParsedOrder } from 'modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { PendingOrdersPrices } from 'modules/orders/state/pendingOrdersPricesAtom'
import { limitOrdersFeatures } from 'constants/featureFlags'
import { QuestionWrapper } from 'legacy/components/QuestionHelper'
import SVG from 'react-inlinesvg'
import iconOrderExecution from 'legacy/assets/cow-swap/orderExecution.svg'
import { X } from 'react-feather'
import { OrderExecutionStatusList } from 'modules/limitOrders/pure/ExecutionPriceTooltip'
import { SpotPricesKeyParams } from 'modules/orders/state/spotPricesAtom'
import { Currency, Price } from '@uniswap/sdk-core'
import { LimitOrderActions } from 'modules/limitOrders/pure/Orders/types'
import { Order } from 'legacy/state/orders/actions'
import {
  TableHeader,
  TableRowCheckbox,
  TableRowCheckboxWrapper,
  CheckboxCheckmark,
} from 'modules/limitOrders/pure/Orders/styled'
import { isOrderOffChainCancellable } from 'common/utils/isOrderOffChainCancellable'

// TODO: move elements to styled.jsx

const TableBox = styled.div`
  display: block;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => transparentize(0.8, theme.text3)};
  padding: 0;
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => transparentize(0.99, theme.bg1)};
  backdrop-filter: blur(20px);

  ${({ theme }) => theme.mediaWidth.upToLargeAlt`
    width: 100%;
    display: flex;
    flex-flow: column wrap;
  `};
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

const HeaderElement = styled.div<{ doubleRow?: boolean; hasBackground?: boolean }>`
  height: 100%;
  padding: 0 ${({ hasBackground }) => (hasBackground ? '10px' : '0')};
  font-size: 12px;
  line-height: 1.1;
  font-weight: 500;
  display: flex;
  align-items: ${({ doubleRow }) => (doubleRow ? 'flex-start' : 'center')};
  background: ${({ theme, hasBackground }) => (hasBackground ? transparentize(0.92, theme.text3) : 'transparent')};

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

  ${QuestionWrapper} {
    opacity: 0.5;
    transition: opacity 0.2s ease-in-out;

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

  ${({ theme }) => theme.mediaWidth.upToLargeAlt`
   display: flex;
   flex-flow: column wrap;
  `};
`

const StyledInvertRateControl = styled(InvertRateControl)`
  display: inline-flex;
  margin-left: 5px;
`

const StyledCloseIcon = styled(X)`
  height: 24px;
  width: 24px;
  opacity: 0.6;
  transition: opacity 0.3s ease-in-out;

  &:hover {
    cursor: pointer;
    opacity: 1;
  }

  > line {
    stroke: ${({ theme }) => theme.text1};
  }
`

const OrdersExplainerBanner = styled.div`
  display: grid;
  background: ${({ theme }) => theme.gradient1};
  width: 100%;
  gap: 16px;
  grid-template-columns: 6.2fr 5.5fr 24px;
  grid-template-rows: minmax(90px, 1fr);
  align-items: center;
  border-top: 1px solid transparent;
  border-bottom: 1px solid ${({ theme }) => transparentize(0.88, theme.text3)};
  padding: 0 16px;

  ${({ theme }) => theme.mediaWidth.upToLargeAlt`
    width: fit-content;
    grid-template-columns: minmax(462px, 4fr) minmax(426px, 3.8fr) 24px;
  `}

  /* 1st section */
  > div {
    display: flex;
    align-items: center;
    gap: 12px;

    > svg > path {
      fill: ${({ theme }) => transparentize(0.5, theme.text1)};
    }

    > b {
      font-size: 18px;
      font-weight: 500;
    }
  }

  /* 2nd section */
  > span {
    display: flex;
    flex-flow: column wrap;
  }
`

export interface OrdersTableProps {
  isOpenOrdersTab: boolean
  allowsOffchainSigning: boolean
  currentPageNumber: number
  chainId: SupportedChainId | undefined
  pendingOrdersPrices: PendingOrdersPrices
  orders: ParsedOrder[]
  selectedOrders: Order[]
  balancesAndAllowances: BalancesAndAllowances
  getSpotPrice: (params: SpotPricesKeyParams) => Price<Currency, Currency> | null
  orderActions: LimitOrderActions
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
}: OrdersTableProps) {
  const [isRateInverted, setIsRateInverted] = useState(false)
  const checkboxRef = useRef<HTMLInputElement>(null)

  const step = currentPageNumber * LIMIT_ORDERS_PAGE_SIZE
  const ordersPage = orders.slice(step - LIMIT_ORDERS_PAGE_SIZE, step).sort(ordersSorter)
  const onScroll = useCallback(() => {
    // Emit event to close OrderContextMenu
    document.body.dispatchEvent(new Event('mousedown', { bubbles: true }))
  }, [])

  const isRowSelectable = allowsOffchainSigning

  const selectedOrdersMap = useMemo(() => {
    if (!selectedOrders) return {}

    return selectedOrders.reduce((acc, val) => {
      acc[val.id] = true

      return acc
    }, {} as { [key: string]: true })
  }, [selectedOrders])

  // Explainer banner for orders
  const [showOrdersExplainerBanner, setShowOrdersExplainerBanner] = useState(() => {
    const item = localStorage.getItem('showOrdersExplainerBanner')
    return item !== null ? item === 'true' : true
  })

  const closeOrdersExplainerBanner = (): void => {
    setShowOrdersExplainerBanner(false)
    localStorage.setItem('showOrdersExplainerBanner', 'false')
  }

  useEffect(() => {
    localStorage.setItem('showOrdersExplainerBanner', showOrdersExplainerBanner.toString())
  }, [showOrdersExplainerBanner])

  const cancellableOrders = useMemo(() => ordersPage.filter(isOrderOffChainCancellable), [ordersPage])

  const allOrdersSelected = useMemo(() => {
    if (!cancellableOrders.length) return false

    return cancellableOrders.every((item) => selectedOrdersMap[item.id])
  }, [cancellableOrders, selectedOrdersMap])

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
                      orderActions.toggleOrdersForCancellation(event.target.checked ? ordersPage : [])
                    }
                  />
                  <CheckboxCheckmark />
                </TableRowCheckboxWrapper>
              </HeaderElement>
            )}

            <HeaderElement>
              <Trans>Sell &#x2192; Buy</Trans>
            </HeaderElement>

            <HeaderElement>
              <span>
                <Trans>Limit price</Trans>
              </span>
              <StyledInvertRateControl onClick={() => setIsRateInverted(!isRateInverted)} />
            </HeaderElement>

            {isOpenOrdersTab && limitOrdersFeatures.DISPLAY_EST_EXECUTION_PRICE && (
              <HeaderElement doubleRow>
                <span>
                  <Trans>
                    Order executes at <QuestionHelper text={<RateTooltipHeader />} />
                  </Trans>
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

            {isOpenOrdersTab && (
              <HeaderElement hasBackground>
                <span>
                  <Trans>
                    Executes at <QuestionHelper text={<RateTooltipHeader isOpenOrdersTab={isOpenOrdersTab} />} />
                  </Trans>
                </span>
              </HeaderElement>
            )}

            {!isOpenOrdersTab && (
              <HeaderElement>
                <span>
                  <Trans>
                    Execution price <QuestionHelper text={<RateTooltipHeader />} />
                  </Trans>
                </span>
              </HeaderElement>
            )}

            {isOpenOrdersTab && (
              <HeaderElement doubleRow>
                <Trans>Expires</Trans>
                <i>
                  <Trans>Created</Trans>
                </i>
              </HeaderElement>
            )}

            {/* {!isOpenOrdersTab && limitOrdersFeatures.DISPLAY_EXECUTION_TIME && (
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

          {/* Show explainer modal if user hasn't closed it */}
          {isOpenOrdersTab && showOrdersExplainerBanner && (
            <OrdersExplainerBanner>
              <div>
                <SVG src={iconOrderExecution} width={36} height={36} />
                <b>
                  How close is my <br /> order to executing?
                </b>
              </div>
              <span>{OrderExecutionStatusList()}</span>
              <StyledCloseIcon onClick={closeOrdersExplainerBanner} />
            </OrdersExplainerBanner>
          )}

          <Rows>
            {ordersPage.map((order) => (
              <OrderRow
                key={order.id}
                isRowSelectable={isRowSelectable}
                isRowSelected={!!selectedOrdersMap[order.id]}
                isOpenOrdersTab={isOpenOrdersTab}
                order={order}
                spotPrice={getSpotPrice({
                  chainId: chainId as SupportedChainId,
                  sellTokenAddress: order.sellToken,
                  buyTokenAddress: order.buyToken,
                })}
                prices={pendingOrdersPrices[order.id]}
                orderParams={getOrderParams(chainId, balancesAndAllowances, order)}
                isRateInverted={isRateInverted}
                orderActions={orderActions}
                onClick={() => orderActions.selectReceiptOrder(order.id)}
              />
            ))}
          </Rows>
        </TableInner>
      </TableBox>

      {/* Only show pagination if more than 1 page available */}
      {orders.length > LIMIT_ORDERS_PAGE_SIZE && (
        <OrdersTablePagination
          pageSize={LIMIT_ORDERS_PAGE_SIZE}
          totalCount={orders.length}
          currentPage={currentPageNumber}
        />
      )}
    </>
  )
}
