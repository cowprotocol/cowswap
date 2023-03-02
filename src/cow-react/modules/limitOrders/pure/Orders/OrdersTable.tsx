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
  background: ${({ theme }) => transparentize(0.99, theme.bg1)};
  backdrop-filter: blur(20px);

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
  padding: 0;
  overflow-y: hidden;
  overflow-x: auto; // fallback for 'overlay'
  overflow-x: overlay;
  ${({ theme }) => theme.colorScrollbar};
`

const Header = styled.div<{isOpenOrdersTab: boolean}>`
  display: grid;
  gap: 16px;
  grid-template-columns: ${({ isOpenOrdersTab }) => `minmax(200px,4fr) repeat(2,minmax(110px,2.2fr)) ${isOpenOrdersTab ? 'minmax(130px,2.2fr)' : ''} minmax(90px,1fr) minmax(50px,1fr) 108px 36px`};
  align-items: center;
  border-top: 1px solid transparent;
  border-bottom: 1px solid ${({ theme }) => transparentize(0.8, theme.text3)};
  padding: 0 16px;
`

const HeaderElement = styled.div<{ doubleRow?: boolean, hasBackground?: boolean }>`
  --height: 50px;
  padding: 0 ${({ hasBackground }) => hasBackground ? '10px' : '0'};
  font-size: 12px;
  line-height: 1.1;
  font-weight: 400;
  display: flex;
  align-items: ${({ doubleRow}) => (doubleRow ? 'flex-start' : 'center')};
  height: var(--height);
  background: ${({ theme, hasBackground }) => hasBackground ? transparentize(0.92, theme.text3) : 'transparent'};

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
`

const RowElement = styled(Header)`
  --height: 50px;
  min-height: var(--height);
  background: transparent;
  transition: background 0.15s ease-in-out;

  &:hover {
    background: ${({ theme }) => transparentize(0.9, theme.text3)};
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
          <Header isOpenOrdersTab={isOpenOrdersTab}>
            <HeaderElement>
              <Trans>Sell &#x2192; Buy</Trans>
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

            {isOpenOrdersTab && (
              <HeaderElement>
                <span>
                  <Trans>
                    Market price
                  </Trans>
                </span>
              </HeaderElement>
            )}

            {isOpenOrdersTab && (
              <HeaderElement hasBackground>
                <span>
                  <Trans>
                    Executes at <QuestionHelper text={RateTooltipHeader} />
                  </Trans>
                </span>
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
