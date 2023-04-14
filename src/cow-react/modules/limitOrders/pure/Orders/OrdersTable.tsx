import { Order } from 'state/orders/actions'
import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'
import { useCallback, useState, useEffect } from 'react'
import { OrdersTablePagination } from './OrdersTablePagination'
import { OrderRow } from './OrderRow'
import { InvertRateControl } from '@cow/common/pure/RateInfo'
import { EffectiveBalances } from '@cow/modules/tokens'
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
import { QuestionWrapper } from 'components/QuestionHelper'
import SVG from 'react-inlinesvg'
import iconOrderExecution from 'assets/cow-swap/orderExecution.svg'
import { X } from 'react-feather'
import { OrderExecutionStatusList } from '@cow/modules/limitOrders/pure/ExecutionPriceTooltip'
import { SpotPricesKeyParams } from '@cow/modules/orders/state/spotPricesAtom'
import { Currency, Price } from '@uniswap/sdk-core'

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

const Header = styled.div<{ isOpenOrdersTab: boolean }>`
  --height: 50px;
  display: grid;
  gap: 16px;

  grid-template-columns: ${({ isOpenOrdersTab }) =>
    `3.2fr repeat(2,2fr) ${isOpenOrdersTab ? '2.5fr 1.4fr' : ''} 0.7fr 108px 24px`};
  grid-template-rows: minmax(var(--height), 1fr);
  align-items: center;
  border: none;
  border-bottom: 1px solid ${({ theme }) => transparentize(0.8, theme.text3)};
  padding: 0 16px;

  ${({ theme, isOpenOrdersTab }) => theme.mediaWidth.upToLargeAlt`
  grid-template-columns: ${`minmax(200px,2fr) repeat(2,minmax(110px,2fr)) ${
    isOpenOrdersTab ? 'minmax(140px,2.2fr) minmax(100px,1fr)' : ''
  } minmax(50px,1fr) 108px 24px`};
  `}
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

const RowElement = styled(Header)`
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
  currentPageNumber: number
  chainId: SupportedChainId | undefined
  pendingOrdersPrices: PendingOrdersPrices
  orders: ParsedOrder[]
  effectiveBalances: EffectiveBalances
  getSpotPrice: (params: SpotPricesKeyParams) => Price<Currency, Currency> | null
  getShowCancellationModal(order: Order): (() => void) | null
}

export function OrdersTable({
  isOpenOrdersTab,
  chainId,
  orders,
  pendingOrdersPrices,
  effectiveBalances,
  getSpotPrice,
  getShowCancellationModal,
  currentPageNumber,
}: OrdersTableProps) {
  const [isRateInverted, setIsRateInverted] = useState(false)

  const selectReceiptOrder = useSelectReceiptOrder()
  const step = currentPageNumber * LIMIT_ORDERS_PAGE_SIZE
  const ordersPage = orders.slice(step - LIMIT_ORDERS_PAGE_SIZE, step).sort(ordersSorter)
  const onScroll = useCallback(() => {
    // Emit event to close OrderContextMenu
    document.body.dispatchEvent(new Event('mousedown', { bubbles: true }))
  }, [])

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
          </Header>

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
                isOpenOrdersTab={isOpenOrdersTab}
                order={order}
                spotPrice={getSpotPrice({
                  chainId: chainId as SupportedChainId,
                  sellTokenAddress: order.sellToken,
                  buyTokenAddress: order.buyToken,
                })}
                prices={pendingOrdersPrices[order.id]}
                orderParams={getOrderParams(chainId, effectiveBalances, order)}
                RowElement={RowElement}
                isRateInverted={isRateInverted}
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
