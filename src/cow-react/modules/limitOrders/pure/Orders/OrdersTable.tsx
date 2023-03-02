import { Order } from 'state/orders/actions'
import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'
import { useCallback, useState } from 'react'
import { OrdersTablePagination } from './OrdersTablePagination'
import { OrderRow } from './OrderRow'
import { InvertRateControl } from '@cow/common/pure/RateInfo'
import { BalancesAndAllowances } from '../../containers/OrdersWidget/hooks/useOrdersBalancesAndAllowances'
import { useSelectReceiptOrder } from '@cow/modules/limitOrders/containers/OrdersReceiptModal/hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { transparentize } from 'polished'
import { LIMIT_ORDERS_PAGE_SIZE } from '@cow/modules/limitOrders/const/limitOrdersTabs'
import { getOrderParams } from './utils/getOrderParams'
import { ordersSorter } from '@cow/modules/limitOrders/utils/ordersSorter'
import { RateWrapper } from '@cow/common/pure/RateInfo'
import QuestionHelper from 'components/QuestionHelper'
import { RateTooltipHeader } from '@cow/modules/limitOrders/pure/ExecutionPriceTooltip'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { PendingOrdersPrices } from '@cow/modules/orders/state/pendingOrdersPricesAtom'
import { limitOrdersFeatures } from '@cow/constants/featureFlags'

const TableBox = styled.div`
  display: block;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => transparentize(0.8, theme.text3)};
  padding: 0;
  position: relative;
  overflow: hidden;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    display: flex;
    flex-flow: column wrap;
  `};
`

const TableInner = styled.div`
  display: block;
  width: inherit;
  height: inherit;
  padding: 0 0 24px;
  overflow-y: hidden;
  overflow-x: auto; // fallback for 'overlay'
  overflow-x: overlay;
  ${({ theme }) => theme.colorScrollbar};
`

const Header = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(200px, 1fr) minmax(100px, 0.7fr) minmax(140px, 0.85fr) minmax(70px, 0.7fr) 108px 36px;
  align-items: center;
  border-top: 1px solid transparent;
  border-bottom: 1px solid ${({ theme }) => transparentize(0.8, theme.text3)};
  padding: 0 16px;
`

const HeaderElement = styled.div<{ doubleRow?: boolean }>`
  padding: 12px 0;
  font-size: 12px;
  font-weight: 400;
  display: flex;

  > span {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
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

const RowElement = styled(Header)`
  background: transparent;
  transition: background 0.15s ease-in-out;

  &:hover {
    background: ${({ theme }) => transparentize(0.9, theme.text3)};
  }

  > div {
    font-size: 13px;
    font-weight: 400;
  }

  &:last-child {
    border-bottom: 0;
  }

  ${RateWrapper} {
    text-align: left;
  }
`

const Rows = styled.div`
  display: block;
  ${({ theme }) => theme.colorScrollbar};

  ${({ theme }) => theme.mediaWidth.upToMedium`
   display: flex;
   flex-flow: column wrap;
  `};
`

const StyledInvertRateControl = styled(InvertRateControl)`
  display: inline-flex;
  margin-left: 5px;
`

export interface OrdersTableProps {
  isOpenOrdersTab: boolean
  currentPageNumber: number
  chainId: SupportedChainId | undefined
  pendingOrdersPrices: PendingOrdersPrices
  orders: ParsedOrder[]
  balancesAndAllowances: BalancesAndAllowances
  getShowCancellationModal(order: Order): (() => void) | null
}

export function OrdersTable({
  isOpenOrdersTab,
  chainId,
  orders,
  pendingOrdersPrices,
  balancesAndAllowances,
  getShowCancellationModal,
  currentPageNumber,
}: OrdersTableProps) {
  const [isRateInversed, setIsRateInversed] = useState(false)

  const selectReceiptOrder = useSelectReceiptOrder()
  const step = currentPageNumber * LIMIT_ORDERS_PAGE_SIZE
  const ordersPage = orders.slice(step - LIMIT_ORDERS_PAGE_SIZE, step).sort(ordersSorter)
  const onScroll = useCallback(() => {
    // Emit event to close OrderContextMenu
    document.body.dispatchEvent(new Event('mousedown', { bubbles: true }))
  }, [])

  return (
    <>
      <TableBox>
        <TableInner onScroll={onScroll}>
          <Header>
            <HeaderElement>
              <Trans>Order</Trans>
            </HeaderElement>

            <HeaderElement>
              <span>
                <Trans>Limit price</Trans>
              </span>
              <StyledInvertRateControl onClick={() => setIsRateInversed(!isRateInversed)} />
            </HeaderElement>

            {isOpenOrdersTab && limitOrdersFeatures.DISPLAY_EST_EXECUTION_PRICE && (
              <HeaderElement doubleRow>
                <span>
                  <Trans>
                    Order executes at <QuestionHelper text={RateTooltipHeader} />
                  </Trans>
                </span>
                <i>
                  <Trans>Market price</Trans>
                </i>
              </HeaderElement>
            )}

            {!isOpenOrdersTab && (
              <HeaderElement>
                <span>
                  <Trans>
                    Execution price <QuestionHelper text={RateTooltipHeader} />
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

            {!isOpenOrdersTab && limitOrdersFeatures.DISPLAY_EXECUTION_TIME && (
              <HeaderElement>
                <Trans>Execution time</Trans>
              </HeaderElement>
            )}

            <HeaderElement>
              <Trans>Filled</Trans>
            </HeaderElement>

            <HeaderElement>
              <Trans>Status</Trans>
            </HeaderElement>
            <HeaderElement>{/*Cancel order column*/}</HeaderElement>
          </Header>
          <Rows>
            {ordersPage.map((order) => (
              <OrderRow
                key={order.id}
                isOpenOrdersTab={isOpenOrdersTab}
                order={order}
                prices={pendingOrdersPrices[order.id]}
                orderParams={getOrderParams(chainId, balancesAndAllowances, order)}
                RowElement={RowElement}
                isRateInversed={isRateInversed}
                getShowCancellationModal={getShowCancellationModal}
                onClick={() => selectReceiptOrder(order.id)}
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
